import base64
import io
import json
import os
import re
from typing import Callable, Optional, List, Dict

class AIEngine:
    """
    Multimodal AI Engine that takes screen snippets (math, equations, diagrams, code)
    and produces structured step-by-step derivations and handles conversational follow-ups.
    Supports Google Gemini (default) and OpenAI, with a smart fallback/demo mode.
    """
    
    SYSTEM_PROMPT = """You are Clicky, a fast and ultra-sharp desktop AI tutor.
The user just circled a region on their screen.

Your task:
1. Identify the core equation, problem, or text detected.
2. Provide a concise, clear step-by-step derivation.
3. Format math using LaTeX: inline $...$, display $$...$$.
4. Highlight the final answer clearly at the end.
Be direct, fast, and avoid unnecessary filler.

Format in clean Markdown:
### 🎯 Problem Detected:
[Core equation or question]

### 📐 Step-by-Step Derivation:
1. **[Step]**: Explanation with formula
2. **[Step]**: Explanation with formula

### ✨ Final Answer:
$$[Final Value]$$
"""

    def __init__(self, config: dict):
        self.config = config
        self.chat_history: List[Dict[str, str]] = []
        self.last_image_bytes: Optional[bytes] = None
        self._openai_client = None
        self._openai_key = None

    def _get_openai_client(self, api_key: str):
        if self._openai_client is None or self._openai_key != api_key:
            from openai import OpenAI
            self._openai_client = OpenAI(api_key=api_key, timeout=18.0)
            self._openai_key = api_key
        return self._openai_client

    def reset_chat(self):
        self.chat_history.clear()
        self.last_image_bytes = None

    def analyze_image(
        self,
        image_bytes: bytes,
        custom_question: Optional[str] = None
    ) -> str:
        self.last_image_bytes = image_bytes
        self.chat_history.clear()
        provider = self.config.get("api_provider", "gemini").lower()
        gemini_key = self.config.get("gemini_api_key") or os.environ.get("GEMINI_API_KEY", "")
        openai_key = self.config.get("openai_api_key") or os.environ.get("OPENAI_API_KEY", "")

        user_prompt = custom_question if custom_question else "Please solve this equation or explain what is circled on my screen. Show how the value of the variable is derived step-by-step."

        # 1. Try Gemini
        if provider == "gemini" and gemini_key:
            try:
                reply = self._call_gemini(image_bytes, user_prompt, gemini_key)
                self.chat_history.append({"role": "user", "content": user_prompt})
                self.chat_history.append({"role": "assistant", "content": reply})
                return reply
            except Exception as e:
                return f"⚠️ **Gemini API Error:** {str(e)}\n\n*Check your API key in Settings.*"

        # 2. Try OpenAI
        elif provider == "openai" and openai_key:
            try:
                reply = self._call_openai(image_bytes, user_prompt, openai_key)
                self.chat_history.append({"role": "user", "content": user_prompt})
                self.chat_history.append({"role": "assistant", "content": reply})
                return reply
            except Exception as e:
                return f"⚠️ **OpenAI API Error:** {str(e)}\n\n*Check your API key in Settings.*"

        # 3. Demo / Offline Mode with smart contextual responses
        reply = self._demo_response(custom_question)
        self.chat_history.append({"role": "user", "content": user_prompt})
        self.chat_history.append({"role": "assistant", "content": reply})
        return reply

    def answer_follow_up(self, user_question: str) -> str:
        """Answers a follow-up query with the existing screenshot and chat context."""
        provider = self.config.get("api_provider", "gemini").lower()
        gemini_key = self.config.get("gemini_api_key") or os.environ.get("GEMINI_API_KEY", "")
        openai_key = self.config.get("openai_api_key") or os.environ.get("OPENAI_API_KEY", "")

        # 1. Gemini
        if provider == "gemini" and gemini_key and self.last_image_bytes:
            try:
                context_prompt = "Conversation so far:\n"
                for msg in self.chat_history[-4:]:
                    context_prompt += f"{msg['role'].capitalize()}: {msg['content']}\n"
                context_prompt += f"\nUser follow-up question: {user_question}\nPlease answer concisely with LaTeX math where appropriate."
                reply = self._call_gemini(self.last_image_bytes, context_prompt, gemini_key)
                self.chat_history.append({"role": "user", "content": user_question})
                self.chat_history.append({"role": "assistant", "content": reply})
                return reply
            except Exception as e:
                return f"⚠️ **Gemini Error:** {str(e)}"

        # 2. OpenAI
        elif provider == "openai" and openai_key:
            try:
                client = self._get_openai_client(openai_key)
                messages = [{"role": "system", "content": "You are Clicky, a fast math tutor. Answer the user's follow-up directly and concisely using LaTeX."}]
                for msg in self.chat_history[-2:]:
                    messages.append({"role": msg["role"], "content": msg["content"]})
                messages.append({"role": "user", "content": user_question})

                response = client.chat.completions.create(
                    model=self.config.get("openai_model", "gpt-4o-mini"),
                    messages=messages,
                    max_tokens=350,
                    temperature=0.2
                )
                reply = response.choices[0].message.content or "No response from OpenAI."
                self.chat_history.append({"role": "user", "content": user_question})
                self.chat_history.append({"role": "assistant", "content": reply})
                return reply
            except Exception as e:
                return f"⚠️ **OpenAI Error:** {str(e)}"

        # 3. Contextual Offline / Demo Solver
        reply = self._smart_offline_follow_up(user_question)
        self.chat_history.append({"role": "user", "content": user_question})
        self.chat_history.append({"role": "assistant", "content": reply})
        return reply

    def _call_gemini(self, image_bytes: bytes, user_prompt: str, api_key: str) -> str:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            model_name = self.config.get("gemini_model", "gemini-2.5-flash")

            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type="image/png"
            )

            contents = [
                self.SYSTEM_PROMPT,
                image_part,
                user_prompt
            ]

            response = client.models.generate_content(
                model=model_name,
                contents=contents
            )
            return response.text or "No response received from Gemini."

        except ImportError:
            return self._call_gemini_rest(image_bytes, user_prompt, api_key)

    def _call_gemini_rest(self, image_bytes: bytes, user_prompt: str, api_key: str) -> str:
        import requests
        b64_img = base64.b64encode(image_bytes).decode("utf-8")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{self.SYSTEM_PROMPT}\n\nUser Question: {user_prompt}"},
                        {
                            "inline_data": {
                                "mime_type": "image/png",
                                "data": b64_img
                            }
                        }
                    ]
                }
            ]
        }
        resp = requests.post(url, json=payload, timeout=30)
        data = resp.json()
        if "error" in data:
            raise RuntimeError(data["error"].get("message", "Unknown error"))
        return data["candidates"][0]["content"]["parts"][0]["text"]

    def _call_openai(self, image_bytes: bytes, user_prompt: str, api_key: str) -> str:
        client = self._get_openai_client(api_key)
        b64_img = base64.b64encode(image_bytes).decode("utf-8")

        response = client.chat.completions.create(
            model=self.config.get("openai_model", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": self.SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{b64_img}",
                                "detail": "low"
                            }
                        }
                    ]
                }
            ],
            max_tokens=450,
            temperature=0.2
        )
        return response.choices[0].message.content or "No response from OpenAI."

    def _demo_response(self, custom_question: Optional[str] = None) -> str:
        return """### 🎯 Equation Detected:
$$2x^2 - 8x - 24 = 0$$

### 📐 Step-by-Step Derivation:
1. **Divide by leading coefficient $2$:**
   Simplify the equation by dividing every term by $2$:
   $$x^2 - 4x - 12 = 0$$

2. **Factor the quadratic expression:**
   We look for two numbers that multiply to $-12$ and add to $-4$.
   Those two numbers are $-6$ and $+2$:
   $$(x - 6)(x + 2) = 0$$

3. **Solve for the roots:**
   Set each factor to zero by the Zero Product Property:
   $$x - 6 = 0 \\implies x = 6$$
   $$x + 2 = 0 \\implies x = -2$$

---

### 💡 Why this is the result:
The parabola $y = 2x^2 - 8x - 24$ crosses the horizontal axis ($y = 0$) at two distinct points: $x = 6$ and $x = -2$.

### ✨ Final Answer:
$$x \\in \\{-2, 6\\}$$
"""

    def _smart_offline_follow_up(self, q: str) -> str:
        """Generates dynamic answers to follow-up questions in demo/offline mode."""
        q_lower = q.lower()

        if "why" in q_lower and ("factor" in q_lower or "2" in q_lower or "divide" in q_lower):
            return """### 💡 Why we divided by $2$ and factored:
Dividing by $2$ simplifies $2x^2 - 8x - 24 = 0$ into monic form ($x^2 - 4x - 12 = 0$).

When factoring $x^2 + Bx + C = (x + p)(x + q)$:
- The product $p \\cdot q = C = -12$
- The sum $p + q = B = -4$

Checking pairs of factors of $-12$:
- $(1, -12) \\rightarrow \\text{sum} = -11$
- $(2, -6) \\rightarrow \\text{sum} = -4$  ✓ **Match!**

Therefore, $(x - 6)(x + 2) = 0$."""

        elif "formula" in q_lower or "quadratic formula" in q_lower:
            return """### 🧮 Solving via the Quadratic Formula:
For $ax^2 + bx + c = 0$, where $a=2, b=-8, c=-24$:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

Substitute the values:
$$x = \\frac{-(-8) \\pm \\sqrt{(-8)^2 - 4(2)(-24)}}{2(2)}$$
$$x = \\frac{8 \\pm \\sqrt{64 + 192}}{4}$$
$$x = \\frac{8 \\pm \\sqrt{256}}{4}$$
$$x = \\frac{8 \\pm 16}{4}$$

Evaluating both signs:
$$x_1 = \\frac{8 + 16}{4} = \\frac{24}{4} = 6$$
$$x_2 = \\frac{8 - 16}{4} = \\frac{-8}{4} = -2$$

Both methods yield the exact same solution: $x = 6$ or $x = -2$."""

        elif "check" in q_lower or "verify" in q_lower or "plug" in q_lower:
            return """### ✅ Verification:
Let's plug $x = 6$ into the original equation:
$$2(6)^2 - 8(6) - 24 = 2(36) - 48 - 24 = 72 - 72 = 0 \\quad \\checkmark$$

Now plug in $x = -2$:
$$2(-2)^2 - 8(-2) - 24 = 2(4) + 16 - 24 = 8 + 16 - 24 = 0 \\quad \\checkmark$$

Both solutions are completely correct and verified."""

        else:
            safe_q = html.escape(q)
            return (
                f'### 🤖 Clicky\'s Explanation:\n'
                f'Regarding your question: *"{safe_q}"*\n\n'
                'For the quadratic equation $2x^2 - 8x - 24 = 0$:\n'
                '1. The discriminant $\\Delta = b^2 - 4ac$ determines the nature of the roots:\n'
                '   $$\\Delta = (-8)^2 - 4(2)(-24) = 256 > 0$$\n'
                '   Since $\\Delta > 0$ and is a perfect square ($16^2$), there are **two distinct rational roots**.\n'
                '2. The roots $x = 6$ and $x = -2$ are symmetric about the vertex axis $x = -\\frac{b}{2a} = 2$.\n'
                '   Notice: $2 + 4 = 6$ and $2 - 4 = -2$.\n\n'
                '*Tip: Paste your Gemini or OpenAI API Key in Settings (⚙️) anytime to ask arbitrary complex questions on any topic!*'
            )
