import re
import html

LATEX_REPLACEMENTS = [
    (r"\\implies", " ⟹ "),
    (r"\\pm", "±"),
    (r"\\mp", "∓"),
    (r"\\times", "×"),
    (r"\\cdot", "·"),
    (r"\\div", "÷"),
    (r"\\approx", "≈"),
    (r"\\neq", "≠"),
    (r"\\leq", "≤"),
    (r"\\le\b", "≤"),
    (r"\\geq", "≥"),
    (r"\\ge\b", "≥"),
    (r"\\in", "∈"),
    (r"\\notin", "∉"),
    (r"\\infty", "∞"),
    (r"\\Delta", "Δ"),
    (r"\\pi", "π"),
    (r"\\theta", "θ"),
    (r"\\alpha", "α"),
    (r"\\beta", "β"),
    (r"\\checkmark", "✓"),
    (r"\\quad", "  "),
    (r"\\left\(", "("),
    (r"\\right\)", ")"),
    (r"\\left\[", "["),
    (r"\\right\]", "]"),
    (r"\\left\\{", "{"),
    (r"\\right\\}", "}"),
    (r"\\\{", "{"),
    (r"\\\}", "}"),
    (r"\\text\{([^}]+)\}", r"\1"),
]

def format_math_latex(tex: str) -> str:
    """Converts LaTeX math expression into clean Unicode & styled HTML."""
    res = tex.strip()

    # Fractions: \frac{a}{b} -> (a) / (b)
    for _ in range(4):
        res = re.sub(r"\\frac\{([^{}]+)\}\{([^{}]+)\}", r"(\1 / \2)", res)

    # Square roots: \sqrt{a} -> √(a)
    for _ in range(3):
        res = re.sub(r"\\sqrt\{([^{}]+)\}", r"√(\1)", res)

    for pattern, repl in LATEX_REPLACEMENTS:
        res = re.sub(pattern, repl, res)

    # Superscripts
    res = re.sub(r"\^2\b", "²", res)
    res = re.sub(r"\^3\b", "³", res)
    res = re.sub(r"\^\{([^}]+)\}", r"<sup>\1</sup>", res)
    res = re.sub(r"\^([0-9a-zA-Z])", r"<sup>\1</sup>", res)

    # Subscripts
    res = re.sub(r"_1\b", "₁", res)
    res = re.sub(r"_2\b", "₂", res)
    res = re.sub(r"_0\b", "₀", res)
    res = re.sub(r"_\{([^}]+)\}", r"<sub>\1</sub>", res)
    res = re.sub(r"_([0-9a-zA-Z])", r"<sub>\1</sub>", res)

    # Strip leftover backslashes
    res = re.sub(r"\\([a-zA-Z]+)", r"\1", res)
    return res

def markdown_to_rich_html(markdown_text: str) -> str:
    """Converts LLM response with Markdown and LaTeX to crisp HTML for QTextBrowser."""
    text = markdown_text.strip()

    # 1. Standalone display math: $$ ... $$ or \[ ... \]
    def replace_display_math(m):
        raw_tex = m.group(1)
        formatted = format_math_latex(raw_tex)
        return f'<div class="math-card">{formatted}</div>'

    text = re.sub(r"\$\$(.*?)\$\$", replace_display_math, text, flags=re.DOTALL)
    text = re.sub(r"\\\[(.*?)\\\]", replace_display_math, text, flags=re.DOTALL)

    # 2. Inline math: $ ... $ or \( ... \)
    def replace_inline_math(m):
        raw_tex = m.group(1)
        formatted = format_math_latex(raw_tex)
        return f'<span class="math-inline">{formatted}</span>'

    text = re.sub(r"\$([^\$\n]+)\$", replace_inline_math, text)
    text = re.sub(r"\\\((.*?)\\\)", replace_inline_math, text)

    lines = text.split("\n")
    out_lines = []
    in_list = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            if in_list:
                out_lines.append("</ol>")
                in_list = False
            continue

        if stripped.startswith("### "):
            if in_list:
                out_lines.append("</ol>")
                in_list = False
            out_lines.append(f'<div class="section-title">{stripped[4:]}</div>')
        elif stripped.startswith("## "):
            if in_list:
                out_lines.append("</ol>")
                in_list = False
            out_lines.append(f'<div class="section-title">{stripped[3:]}</div>')
        elif stripped.startswith("> "):
            out_lines.append(f'<div class="callout">{stripped[2:]}</div>')
        elif re.match(r"^\d+\.\s", stripped):
            if not in_list:
                out_lines.append("<ol>")
                in_list = True
            item_text = re.sub(r"^\d+\.\s", "", stripped)
            out_lines.append(f"<li>{_inline_md(item_text)}</li>")
        elif stripped.startswith("- ") or stripped.startswith("* "):
            if not in_list:
                out_lines.append("<ul>")
                in_list = True
            item_text = stripped[2:]
            out_lines.append(f"<li>{_inline_md(item_text)}</li>")
        elif stripped.startswith("<div class=\"math-card\">"):
            out_lines.append(stripped)
        else:
            if in_list:
                out_lines.append("</ol>")
                in_list = False
            out_lines.append(f"<p>{_inline_md(stripped)}</p>")

    if in_list:
        out_lines.append("</ol>")

    return "\n".join(out_lines)

def _inline_md(s: str) -> str:
    s = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"\*(.*?)\*", r"<i>\1</i>", s)
    s = re.sub(r"`(.*?)`", r"<code>\1</code>", s)
    return s
