
# -*- coding: utf-8 -*-
import heapq
import random
import re
from typing import Dict, List, Optional, Set, Tuple

from knowledge_base import (
    diseases,
    symptom_concepts,
    question_tree,
    general_questions,
    emergency_symptoms,
    priority_map,
    severity_keywords,
    symptom_followup_templates,
    diagnosis_intro,
    diagnosis_second_intro,
    diagnosis_closer,
    treatment_prompt,
    advice_prompt,
    opening_complaint_prompt,
    negation_words,
    doctor_phrases,
)

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = text.strip().lower()
    repl = {
        "أ":"ا","إ":"ا","آ":"ا","ة":"ه","ى":"ي","ؤ":"و","ئ":"ي",
    }
    for a,b in repl.items():
        text = text.replace(a,b)
    text = re.sub(r"[^\u0600-\u06FF0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def tokenize(text: str) -> List[str]:
    return normalize_text(text).split()

def light_stem(token: str) -> str:
    token = normalize_text(token)
    prefixes = ["وال", "بال", "كال", "فال", "لل", "ال", "و", "ف", "ب", "ك", "ل"]
    suffixes = ["هما","كما","كم","كن","هم","هن","نا","ها","ه","ات","ون","ين","يه","يه","تي","ة","ه","ي","ك","ا"]
    changed = True
    while changed:
        changed = False
        for p in prefixes:
            if token.startswith(p) and len(token) - len(p) >= 3:
                token = token[len(p):]
                changed = True
                break
    for s in suffixes:
        if token.endswith(s) and len(token) - len(s) >= 3:
            token = token[:-len(s)]
            break
    return token

def phrase_present(text: str, phrase: str) -> bool:
    return normalize_text(phrase) in normalize_text(text)

def nearby_negation(text: str, phrase: str) -> bool:
    ntext = normalize_text(text)
    nphrase = normalize_text(phrase)
    idx = ntext.find(nphrase)
    if idx == -1:
        return False
    window = ntext[max(0, idx - 25): idx]
    return any(normalize_text(neg) in window.split() or normalize_text(neg) in window for neg in negation_words)

class ConversationEngine:
    def __init__(self):
        self.reset()

    def reset(self):
        self.state = "WAITING_NAME"
        self.patient_name = ""
        self.detected_symptoms: Set[str] = set()
        self.negated_symptoms: Set[str] = set()
        self.symptom_confidence: Dict[str, str] = {}
        self.symptom_queue: List[Tuple[int,int,str]] = []
        self.queue_counter = 0
        self.completed_symptoms: Set[str] = set()
        self.in_progress_symptoms: Set[str] = set()
        self.asked_question_ids: Set[str] = set()
        self.asked_general_indices: Set[int] = set()
        self.current_symptom: Optional[str] = None
        self.current_questions: List[Dict] = []
        self.current_question_index = 0
        self.current_question_data: Optional[Dict] = None
        self.diagnosis_cache: Optional[List[Dict]] = None
        self.emergency_alert_sent = False
        self.last_phrase = ""
        self.name_confirmed = False

    def humanize(self, question: str, kind: str = "clarify") -> str:
        options = [x for x in doctor_phrases.get(kind, []) if x != self.last_phrase] or doctor_phrases.get(kind, [])
        phrase = random.choice(options) if options else ""
        self.last_phrase = phrase
        if phrase:
            return f"{phrase} {question}"
        return question

    def set_name(self, full_name: str):
        first = (full_name or "").strip().split()
        self.patient_name = first[0] if first else "حضرتك"

    def get_priority(self, symptom: str) -> int:
        return priority_map.get(symptom, 50)

    def queue_contains(self, symptom: str) -> bool:
        return any(item[2] == symptom for item in self.symptom_queue)

    def add_symptom(self, symptom: str, confidence: str = "متوسط"):
        if symptom in self.negated_symptoms:
            self.negated_symptoms.discard(symptom)
        if symptom not in self.detected_symptoms:
            self.detected_symptoms.add(symptom)
        if symptom not in self.completed_symptoms and symptom not in self.in_progress_symptoms and not self.queue_contains(symptom):
            self.queue_counter += 1
            heapq.heappush(self.symptom_queue, (-self.get_priority(symptom), self.queue_counter, symptom))
        rank = {"خفيف":1,"متوسط":2,"شديد":3}
        old = self.symptom_confidence.get(symptom, "خفيف")
        if rank.get(confidence,2) > rank.get(old,1):
            self.symptom_confidence[symptom] = confidence
        self.diagnosis_cache = None

    def negate_symptom(self, symptom: str):
        self.negated_symptoms.add(symptom)
        if symptom in self.detected_symptoms:
            self.detected_symptoms.discard(symptom)
        self.diagnosis_cache = None

    def extract_severity(self, text: str) -> str:
        nt = normalize_text(text)
        for sev, kws in severity_keywords.items():
            if any(normalize_text(k) in nt for k in kws):
                return sev
        return "متوسط"

    def extract_symptoms(self, text: str) -> Tuple[Set[str], Set[str]]:
        found, negated = set(), set()
        nt = normalize_text(text)
        tokens = tokenize(text)
        token_stems = {light_stem(t) for t in tokens}
        for concept, data in symptom_concepts.items():
            for alias in data.get("aliases", []):
                nalias = normalize_text(alias)
                alias_tokens = nalias.split()
                alias_stems = {light_stem(t) for t in alias_tokens}
                matched = False
                if nalias and nalias in nt:
                    matched = True
                elif alias_stems and alias_stems.issubset(token_stems):
                    matched = True
                if matched:
                    if nearby_negation(text, alias):
                        negated.add(concept)
                    else:
                        found.add(concept)
                    break
        severity = self.extract_severity(text)
        for s in found:
            self.add_symptom(s, severity)
        for s in negated:
            self.negate_symptom(s)
        return found, negated

    def should_skip_question(self, q_data: Dict) -> bool:
        targets = q_data.get("targets", [])
        if not targets:
            return False
        unknown = [t for t in targets if t not in self.detected_symptoms and t not in self.negated_symptoms]
        return len(unknown) == 0

    def build_compact_question(self, q_data: Dict) -> Optional[str]:
        targets = q_data.get("targets", [])
        if not targets:
            return q_data["question"]
        unknown = [t for t in targets if t not in self.detected_symptoms and t not in self.negated_symptoms]
        if not unknown:
            return None
        if len(unknown) == len(targets):
            return q_data["question"]
        if len(unknown) <= 2:
            parts = [symptom_followup_templates.get(sym, f"هل توجد علامة تدل على {sym}؟") for sym in unknown]
            if len(parts) == 1:
                return parts[0]
            return " ".join(parts)
        return q_data["question"]

    def start_symptom_questions(self, symptom: str) -> Optional[str]:
        self.current_symptom = symptom
        self.current_questions = question_tree.get(symptom, [])
        self.current_question_index = 0
        self.current_question_data = None
        self.in_progress_symptoms.add(symptom)
        self.state = "ASKING"
        if not self.current_questions:
            self.finish_current_symptom()
            return self.get_next_question()
        return self.get_current_question()

    def finish_current_symptom(self):
        if self.current_symptom:
            self.completed_symptoms.add(self.current_symptom)
            self.in_progress_symptoms.discard(self.current_symptom)
        self.current_symptom = None
        self.current_questions = []
        self.current_question_index = 0
        self.current_question_data = None

    def get_current_question(self) -> Optional[str]:
        while self.current_question_index < len(self.current_questions):
            q_data = self.current_questions[self.current_question_index]
            self.current_question_index += 1
            qid = q_data.get("id", f"{self.current_symptom}_{self.current_question_index}")
            if qid in self.asked_question_ids:
                continue
            if self.should_skip_question(q_data):
                continue
            compact = self.build_compact_question(q_data)
            if not compact:
                continue
            self.asked_question_ids.add(qid)
            self.current_question_data = dict(q_data)
            self.current_question_data["question"] = compact
            return self.humanize(compact, "clarify")
        self.finish_current_symptom()
        return self.get_next_question()

    def process_answer_for_current_question(self, answer: str):
        if not self.current_question_data:
            return
        severity = self.extract_severity(answer)
        normalized_answer = normalize_text(answer)
        answer_map = self.current_question_data.get("answer_map", {})
        explicit_targets = set()
        for key, mapped in answer_map.items():
            if normalize_text(key) in normalized_answer:
                for sym in mapped[:2]:
                    explicit_targets.add(sym)
                    self.add_symptom(sym, severity)
        found, neg = self.extract_symptoms(answer)
        # إذا السؤال كان له targets وإجابة المستخدم نفتها، سجّل النفي
        if any(neg_word in normalized_answer.split() or neg_word in normalized_answer for neg_word in [normalize_text(x) for x in ["لا","مش","مافيش","ما فيش","ليس","لأ"]]):
            for target in self.current_question_data.get("targets", []):
                if target not in found and target not in explicit_targets:
                    self.negate_symptom(target)

    def get_next_general_question(self) -> Optional[str]:
        for idx, q in enumerate(general_questions):
            if idx not in self.asked_general_indices:
                self.asked_general_indices.add(idx)
                self.current_question_data = {"id": f"general_{idx}", "question": q, "answer_map": {}, "targets": []}
                self.state = "ASKING"
                return self.humanize(q, "transition")
        return None

    def get_next_question(self) -> str:
        while self.symptom_queue:
            _, _, symptom = heapq.heappop(self.symptom_queue)
            if symptom in self.completed_symptoms or symptom in self.in_progress_symptoms or symptom in self.negated_symptoms:
                continue
            q = self.start_symptom_questions(symptom)
            if q:
                return q
        general_q = self.get_next_general_question()
        if general_q:
            return general_q
        self.state = "READY_DIAGNOSIS"
        return self.get_diagnosis_summary()

    def calculate_disease_scores(self) -> List[Dict]:
        severity_factor = {"خفيف": 0.8, "متوسط": 1.0, "شديد": 1.25}
        results = []
        for disease in diseases:
            score = 0.0
            for sym, wt in disease["symptom_weights"].items():
                if sym in self.detected_symptoms:
                    score += wt * severity_factor.get(self.symptom_confidence.get(sym, "متوسط"), 1.0)
                if sym in self.negated_symptoms:
                    score -= wt * 0.8
            results.append({"name": disease["name"], "score": score, "disease": disease})
        results.sort(key=lambda x: x["score"], reverse=True)
        return results

    def get_top_results(self) -> List[Dict]:
        if self.diagnosis_cache is None:
            self.diagnosis_cache = [r for r in self.calculate_disease_scores() if r["score"] > 0][:3]
        return self.diagnosis_cache

    def get_diagnosis_summary(self) -> str:
        top = self.get_top_results()
        if not top:
            return "حتى الآن، الصورة غير كافية لتشخيص مبدئي واضح. إذا تحب، إحكِ لي عن الأعراض بشكل أكثر تفصيلًا."
        lines = []
        lines.append(f"{diagnosis_intro} {top[0]['name']}.")
        if len(top) > 1:
            lines.append("")
            lines.append(f"{diagnosis_second_intro} {top[1]['name']}.")
            lines.append(diagnosis_closer)
        return "\n".join(lines)

    def get_treatment(self) -> str:
        top = self.get_top_results()
        if not top:
            return "ما زلت أحتاج إلى أعراض أوضح حتى أذكر علاجًا مبدئيًا مناسبًا."
        best = top[0]["disease"]
        lines = [treatment_prompt, "", f"التشخيص الأقرب حاليًا: {best['name']}", ""]
        lines += [f"- {item}" for item in best["treatment"]]
        return "\n".join(lines)

    def get_advice(self) -> str:
        top = self.get_top_results()
        if not top:
            return "حتى الآن لا أستطيع إعطاء نصائح دقيقة قبل إتضاح الصورة."
        best = top[0]["disease"]
        lines = [advice_prompt, "", f"بخصوص التشخيص الأقرب حاليًا: {best['name']}", ""]
        lines += [f"- {item}" for item in best["advice"]]
        lines += ["", "ألف سلامه على حضرتك."]
        return "\n".join(lines)

    def asked_about_treatment(self, text: str) -> bool:
        n = normalize_text(text)
        keys = ["العلاج","علاج","الدواء","دواء","أدوية","ادوية","هات العلاج","قولي العلاج","اعرض العلاج"]
        return any(normalize_text(k) in n for k in keys)

    def asked_about_advice(self, text: str) -> bool:
        n = normalize_text(text)
        keys = ["النصائح","نصائح","نصايح","تنصحني","اعمل ايه","أعمل ايه","هات النصائح","قل النصائح"]
        return any(normalize_text(k) in n for k in keys)

    def asked_to_diagnose(self, text: str) -> bool:
        n = normalize_text(text)
        keys = ["شخصني","شخ صني","قول التشخيص","خلاص يا دكتور","كفايه اسئله","كفاية اسئلة","زهقت","انا عندى ايه","التشخيص","كفايه كلام","كفاية كلام"]
        return any(normalize_text(k) in n for k in keys)

    def asked_to_end(self, text: str) -> bool:
        n = normalize_text(text)
        keys = ["انهي المحادثه","انهي المحادثة","اقفل الشات","اقفل المحادثه","اقفل المحادثة","مع السلامه","مع السلامة","الجلسة","السشن","السيشن","انهي المكالمه","انهي المكالمة"]
        return any(normalize_text(k) in n for k in keys)

    def maybe_emergency_message(self) -> Optional[str]:
        if self.emergency_alert_sent:
            return None
        if any(sym in self.detected_symptoms for sym in emergency_symptoms):
            self.emergency_alert_sent = True
            return "هناك علامات تستدعي الانتباه، ولو الأعراض شديدة أو بتزيد بسرعة فلا تؤخر المراجعة الطبية العاجلة."
        return None

    def process_message(self, user_input: str) -> str:
        text = (user_input or "").strip()
        if not text:
            return "إتفضل، أكمل كلامك."

        if self.asked_to_end(text):
            self.state = "ENDED"
            return "تمام، ألف سلامة على حضرتك. تم إنهاء الجلسة."

        if self.state == "ENDED":
            return "تم إنهاء الجلسة بالفعل."

        if self.state == "WAITING_NAME":
            self.set_name(text)
            self.state = "WAITING_COMPLAINT"
            return opening_complaint_prompt.format(name=self.patient_name)

        # يسمح بالعلاج أو النصائح أو التشخيص في أي وقت
        if self.asked_about_treatment(text):
            return self.get_treatment()
        if self.asked_about_advice(text):
            return self.get_advice()
        if self.asked_to_diagnose(text):
            self.state = "READY_DIAGNOSIS"
            return self.get_diagnosis_summary()

        if self.state == "WAITING_COMPLAINT":
            self.extract_symptoms(text)
            emergency = self.maybe_emergency_message()
            if not self.detected_symptoms:
                return "أفهم من كلام حضرتك أن هناك تعبًا، لكن أحتاج أن تذكر العرض الأساسي بشكل أوضح، مثل: وجع بطن، غثيان، ترجيع، إسهال، حرارة."
            response = self.get_next_question()
            if emergency and "العلاج" not in response and "النصائح" not in response:
                return f"{emergency}\n\n{response}"
            return response

        if self.state == "ASKING":
            self.process_answer_for_current_question(text)
            emergency = self.maybe_emergency_message()
            response = self.get_current_question() if self.current_symptom else self.get_next_question()
            if emergency and "العلاج" not in response and "النصائح" not in response:
                return f"{emergency}\n\n{response}"
            return response

        if self.state == "READY_DIAGNOSIS":
            return self.get_diagnosis_summary()

        return self.get_next_question()

    def process_input(self, user_input: str) -> str:
        return self.process_message(user_input)
