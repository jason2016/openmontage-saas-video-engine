#!/usr/bin/env python3
"""SaaS Promo Template — generator.

Turns a small per-product config into a Remotion `Explainer` props file, then
prints the exact render command. This is the whole "engine": one place,
no duplicated per-project code, no OpenMontage core changes.

Inputs
  projects/templates/saas-promo/scene-config.json   narrative skeleton (6 scenes)
  projects/templates/saas-promo/theme.json          default colors / fonts
  projects/templates/saas-promo/animation.json      pacing / motion contract
  projects/<name>/config.json                        product-specific values only

Outputs
  remotion-composer/public/demo-props/<name>.json    Explainer props (render input)
  projects/<name>/script.md                           filled from script-template.md
  projects/<name>/storyboard.md                       filled from storyboard-template.md

Usage
  python3 projects/templates/saas-promo/build.py <name> [--out <basename>]
  # <name>      = folder under projects/ that holds config.json
  # --out       = output basename for the props file + render (default: <name>)
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

TEMPLATE_DIR = Path(__file__).resolve().parent
ROOT = TEMPLATE_DIR.parents[2]  # .../openmontage
DEMO_PROPS = ROOT / "remotion-composer" / "public" / "demo-props"
PROJECTS = ROOT / "projects"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def scene_copy(cfg: dict, key: str) -> dict:
    """Resolve a scene's headline/subtitle from the product config, with
    sensible fallbacks so a minimal config (name + features + cta) still
    produces a complete video. Projects override per scene for polish."""
    scenes = cfg.get("scenes", {})
    entry = scenes.get(key) or {}
    if entry.get("headline"):
        return {"headline": entry["headline"], "subtitle": entry.get("subtitle", "")}

    name = cfg.get("productName", "Your product")
    feats = cfg.get("features", [])
    feat_line = "  ·  ".join(feats[:3]) if feats else ""
    cta = cfg.get("cta", {})
    fallbacks = {
        "problem": {"headline": "Still doing it the hard way?", "subtitle": "There is a simpler way."},
        "solution": {"headline": f"Meet {name}.", "subtitle": feat_line or "One simple workflow."},
        "workflow": {"headline": "How it works.", "subtitle": feat_line or "A few simple steps."},
        "security": {"headline": "Built for trust.", "subtitle": "Secure and compliant by design."},
        "benefits": {"headline": f"Why teams choose {name}.", "subtitle": feat_line or "Less effort, better results."},
        "cta": {"headline": name, "subtitle": cta.get("tagline", "Get started today.")},
    }
    return fallbacks.get(key, {"headline": name, "subtitle": ""})


def build_theme_config(theme: dict, animation: dict, cfg: dict) -> dict:
    primary = cfg.get("primaryColor", theme["primary"])
    success = cfg.get("successColor", theme["success"])
    background = cfg.get("backgroundColor", theme["background"])
    surface = cfg.get("surfaceColor", theme["surface"])
    return {
        "primaryColor": primary,
        "accentColor": success,
        "backgroundColor": background,
        "surfaceColor": surface,
        "textColor": theme["text"],
        "mutedTextColor": theme["muted"],
        "headingFont": theme["headingFont"],
        "bodyFont": theme["bodyFont"],
        "monoFont": theme["monoFont"],
        "chartColors": [primary, success, "#38BDF8", "#4ADE80", "#60A5FA", "#34D399"],
        "springConfig": animation.get("springConfig", {"damping": 18, "stiffness": 110, "mass": 1}),
        "transitionDuration": animation.get("transitionDurationSeconds", 0.4),
        "captionHighlightColor": primary,
        "captionBackgroundColor": "rgba(10, 14, 26, 0.75)",
    }


def round3(value: float) -> float:
    return round(value + 0.0, 3)


def build_props(name: str, cfg: dict, scene_cfg: dict, theme: dict, animation: dict) -> dict:
    theme_config = build_theme_config(theme, animation, cfg)
    primary = theme_config["primaryColor"]
    success = theme_config["accentColor"]
    background = theme_config["backgroundColor"]
    default_dur = animation.get("sceneDefaultDurationSeconds", 7)

    cuts = []
    overlays = []
    t = 0.0
    for scene in scene_cfg["scenes"]:
        dur = scene.get("durationSeconds", default_dur)
        copy = scene_copy(cfg, scene["key"])
        accent = primary if scene.get("accent") == "primary" else success
        cuts.append({
            "id": f"{name}-{scene['key']}",
            "source": "",
            "type": scene.get("component", "stat_card"),
            "in_seconds": round3(t),
            "out_seconds": round3(t + dur),
            "stat": copy["headline"],
            "subtitle": copy["subtitle"],
            "accentColor": accent,
            "backgroundColor": background,
        })

        # CTA scene gets a bottom-left lower-third overlay (badge + website).
        if scene.get("cta"):
            cta = cfg.get("cta", {})
            badge = cta.get("badge") or "Get started"
            website = cfg.get("website", "")
            lead = animation.get("ctaOverlayLeadSeconds", 1.5)
            overlays.append({
                "type": "section_title",
                "in_seconds": round3(t + lead),
                "out_seconds": round3(t + dur),
                "text": badge,
                "subtitle": website,
                "accentColor": success,
                "position": "bottom-left",
            })

        t += dur

    return {
        "themeConfig": theme_config,
        "cuts": cuts,
        "overlays": overlays,
        "captions": [],
        "audio": {},
    }


def fill_doc(template_path: Path, mapping: dict, scenes_table: str) -> str:
    text = template_path.read_text(encoding="utf-8")
    for token, value in mapping.items():
        text = text.replace("{{" + token + "}}", str(value))
    text = text.replace("{{SCENES_TABLE}}", scenes_table)
    return text


def scenes_table_md(cfg: dict, scene_cfg: dict, animation: dict) -> str:
    default_dur = animation.get("sceneDefaultDurationSeconds", 7)
    rows = ["| Scene | Headline | Subtitle | Accent | Seconds |", "|---|---|---|---|---|"]
    t = 0.0
    for scene in scene_cfg["scenes"]:
        dur = scene.get("durationSeconds", default_dur)
        copy = scene_copy(cfg, scene["key"])
        rows.append(
            f"| {scene['title']} | {copy['headline']} | {copy['subtitle']} | "
            f"{scene.get('accent')} | {round3(t)}–{round3(t + dur)} |"
        )
        t += dur
    return "\n".join(rows)


def build_saas_props(out: str, cfg: dict, theme: dict) -> dict:
    """Map a product config into the data-driven SaasPromo scene graph: the
    launch-grade 9-beat eSign narrative (brand cold-open, then the 8 product
    beats: problem, upload, invite, OTP, sign, audit, AES eIDAS, CTA) built from
    the saas-pack component library, with a per-beat camera move. Demo specifics
    fall back to product-accurate defaults so a minimal config still produces a
    complete, premium video; projects override per beat for polish."""
    primary = cfg.get("primaryColor", theme["primary"])
    primary_bright = cfg.get("primaryBrightColor", "#60A5FA")
    success = cfg.get("successColor", theme["success"])
    success_bright = cfg.get("successBrightColor", "#4ADE80")
    canvas = cfg.get("backgroundColor", theme["background"])
    name = cfg.get("productName", "Your product")
    website = cfg.get("website", "")
    s = cfg.get("scenes", {}) or {}
    cta = cfg.get("cta", {}) or {}
    demo = cfg.get("demo", {}) or {}

    def beat(key: str) -> dict:
        return s.get(key) or {}

    host = website.split("/")[0] if website else "example.com"
    app_url = demo.get("appUrl") or ("app." + host)
    doc_title = demo.get("docTitle", "Service Agreement.pdf")
    doc_short = demo.get("mobileDocTitle") or doc_title.rsplit(".", 1)[0]
    inbox_label = demo.get("inboxLabel", "Signer inbox")
    subject = demo.get("subject") or ("Please sign: " + doc_title)
    phone_hint = demo.get("phoneHint", "+1 ••• 4821")
    otp = demo.get("otp", "284913")
    fingerprint = demo.get("fingerprint", "SHA-256  3f9a 7c12 b80e … a4d1")
    button_label = demo.get("buttonLabel", "Start free")
    brand_tagline = cfg.get("brandTagline") or beat("solution").get("headline", "")

    default_cards = [
        {"label": "NDA.pdf", "tone": "neutral"},
        {"label": doc_title.replace(".pdf", "") + ".pdf", "tone": "primary"},
        {"label": "Invoice.pdf", "tone": "neutral"},
        {"label": "Agreement.pdf", "tone": "neutral"},
        {"label": "Offer.pdf", "tone": "neutral"},
    ]
    default_audit = [
        {"action": "Document sent", "actor": "you@company.com", "timestamp": "09:42:11"},
        {"action": "Opened by signer", "actor": "alex@client.com", "timestamp": "09:55:03"},
        {"action": "Identity verified · OTP", "actor": phone_hint, "timestamp": "09:55:46"},
        {"action": "Signed", "actor": "Alex Doe", "timestamp": "09:56:20"},
    ]
    default_standards = [
        {"label": "AES", "sub": "Advanced e-signature"},
        {"label": "eIDAS", "sub": "EU regulation"},
        {"label": "SHA-256", "sub": "Document hash"},
        {"label": "OTP 2FA", "sub": "Identity proof"},
    ]

    scenes = [
        {"id": "brand", "type": "brand", "durationSeconds": 3.6, "camera": "pull", "props": {
            "eyebrow": cfg.get("eyebrow", ""),
            "productName": name,
            "tagline": brand_tagline,
        }},
        {"id": "problem", "type": "problem", "durationSeconds": 5.6, "camera": "push", "props": {
            "headline": beat("problem").get("headline", "Still doing it the hard way?"),
            "subtitle": beat("problem").get("subtitle", ""),
            "cards": demo.get("cards", default_cards),
            "stalledIndex": demo.get("stalledIndex", 1),
        }},
        {"id": "upload", "type": "upload", "durationSeconds": 6.0, "camera": "pan-right", "props": {
            "url": app_url, "docTitle": doc_title, "caption": "Upload any PDF", "toast": "PDF added",
        }},
        {"id": "invite", "type": "invite", "durationSeconds": 5.6, "camera": "pan-left", "props": {
            "fromLabel": name, "toLabel": inbox_label, "subject": subject,
            "caption": "Invite the signer", "secure": True,
        }},
        {"id": "otp", "type": "otp", "durationSeconds": 5.6, "camera": "push", "props": {
            "phoneHint": phone_hint, "otp": otp,
            "headline": beat("otp").get("headline", "One code. One signer."),
            "verifiedLabel": "Identity verified",
        }},
        {"id": "sign", "type": "sign", "durationSeconds": 6.0, "camera": "pan-right", "props": {
            "docTitle": doc_short,
            "headline": beat("sign").get("headline", "Sign on any device."),
            "subtitle": beat("sign").get("subtitle", "Draw once. Bound everywhere — desktop, tablet or phone."),
            "signedLabel": "Signed",
        }},
        {"id": "audit", "type": "audit", "durationSeconds": 6.0, "camera": "push", "props": {
            "headline": beat("audit").get("headline", "Every step, recorded."),
            "subtitle": beat("audit").get("subtitle", "A tamper-evident trail behind every signature."),
            "fingerprint": fingerprint,
            "auditEntries": demo.get("auditEntries", default_audit),
        }},
        {"id": "aes", "type": "aes", "durationSeconds": 5.6, "camera": "pull", "props": {
            "eyebrow": beat("aes").get("eyebrow", "Compliance"),
            "headline": beat("aes").get("headline", "AES eIDAS ready."),
            "subtitle": beat("aes").get("subtitle", "Advanced electronic signatures, aligned to EU eIDAS — built in, not bolted on."),
            "standards": demo.get("standards", default_standards),
        }},
        {"id": "cta", "type": "cta", "durationSeconds": 6.0, "camera": "push", "props": {
            "productName": name, "badge": cta.get("badge", ""),
            "tagline": cta.get("tagline", ""), "buttonLabel": button_label, "url": website,
        }},
    ]

    return {
        "brand": {
            "primary": primary,
            "primaryBright": primary_bright,
            "success": success,
            "successBright": success_bright,
            "canvas": canvas,
        },
        "scenes": scenes,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate Explainer props from a SaaS Promo config.")
    parser.add_argument("project", help="Folder name under projects/ containing config.json")
    parser.add_argument("--out", help="Output basename for props + render (default: project name)")
    parser.add_argument(
        "--engine",
        choices=["explainer", "saas-pack"],
        default="explainer",
        help="explainer = legacy text/stat composition (v1/v2); saas-pack = premium component composition (v3)",
    )
    args = parser.parse_args()

    name = args.project
    out = args.out or name
    project_dir = PROJECTS / name
    cfg = load_json(project_dir / "config.json")
    scene_cfg = load_json(TEMPLATE_DIR / "scene-config.json")
    theme = load_json(TEMPLATE_DIR / "theme.json")
    animation = load_json(TEMPLATE_DIR / "animation.json")

    if args.engine == "saas-pack":
        props = build_saas_props(out, cfg, theme)
        DEMO_PROPS.mkdir(parents=True, exist_ok=True)
        props_path = DEMO_PROPS / f"{out}.json"
        props_path.write_text(json.dumps(props, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        total = sum(sc["durationSeconds"] for sc in props["scenes"]) + 1
        render_out = f"../projects/{name}/renders/{out}.mp4"
        print(f"[ok] scene graph -> remotion-composer/public/demo-props/{out}.json  ({len(props['scenes'])} scenes, ~{total:.0f}s)")
        print()
        print("Render with (from remotion-composer/):")
        print(f"  mkdir -p ../projects/{name}/renders && \\")
        print(f"  npx remotion render src/saas-pack/index.tsx SaasPromo {render_out} \\")
        print(f"    --props=public/demo-props/{out}.json --codec h264")
        return 0

    props = build_props(out, cfg, scene_cfg, theme, animation)

    DEMO_PROPS.mkdir(parents=True, exist_ok=True)
    props_path = DEMO_PROPS / f"{out}.json"
    props_path.write_text(json.dumps(props, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # Fill the human-readable docs from the templates.
    mapping = {
        "PRODUCT_NAME": cfg.get("productName", ""),
        "WEBSITE": cfg.get("website", ""),
        "PRIMARY_COLOR": props["themeConfig"]["primaryColor"],
        "SUCCESS_COLOR": props["themeConfig"]["accentColor"],
        "CTA_URL": cfg.get("website", ""),
    }
    table = scenes_table_md(cfg, scene_cfg, animation)
    for tmpl, dest in (("script-template.md", "script.md"), ("storyboard-template.md", "storyboard.md")):
        tmpl_path = TEMPLATE_DIR / tmpl
        if tmpl_path.exists():
            (project_dir / dest).write_text(fill_doc(tmpl_path, mapping, table), encoding="utf-8")

    last_out = max(c["out_seconds"] for c in props["cuts"])
    total = last_out + scene_cfg.get("format", {}).get("tailPaddingSeconds", 1)
    render_out = f"../projects/{name}/renders/{out}.mp4"

    print(f"[ok] props  -> remotion-composer/public/demo-props/{out}.json  ({len(props['cuts'])} scenes, ~{total:.0f}s)")
    print(f"[ok] script -> projects/{name}/script.md")
    print(f"[ok] story  -> projects/{name}/storyboard.md")
    print()
    print("Render with (from remotion-composer/):")
    print(f"  mkdir -p ../projects/{name}/renders && \\")
    print(f"  npx remotion render src/index.tsx Explainer {render_out} \\")
    print(f"    --props=public/demo-props/{out}.json --codec h264")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
