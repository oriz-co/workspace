import os
import re
import yaml
from pathlib import Path

# Roots
KNOWLEDGE_ROOT = Path("c:/D/oriz/knowledge").resolve()
REPO_ROOT = Path("c:/D/oriz").resolve()

# Mappings for classification rules
# Category mappings for rules/
RULES_KEYWORDS = [
    ('agent', ['agent', 'keep-knowledge', 'knowledge-first', 'self-update', 'confirm-knowledge', 'read-before', 'grill-', 'agents-md']),
    ('infrastructure', ['cloudflare', 'firebase-', 'lambda', 'subscriptions', 'paid-self', 'free-tier', 'subdomain', 'shared-tenant']),
    ('security', ['secret', 'env']),
    ('development', ['commit', 'git-', 'push-', 'branch', 'deps', 'pin', 'package', 'pnpm', 'fork', 'repo-naming', 'repos-work', 'tests-', 'web3forms']),
    ('design', ['design-', 'frontend-design', 'ad-slots', 'emoji', 'visual', 'per-app']),
]

# Category mappings for runbooks/
RUNBOOKS_KEYWORDS = [
    ('security', ['auth', 'secret', 'npm-publish', 'razorpay', 'paddle', 'restic', 'backup-metadata', 'feature-flags']),
    ('hosting', ['dns', 'mirror', 'pages', 'codeberg', 'git-upstream', 'migrate-to-oriz-org']),
]

# Category mappings for architecture/
ARCH_KEYWORDS = [
    ('database', ['db', 'cache', 'store', 'schema']),
    ('compute', ['api', 'hono', 'rpc', 'bindings']),
    ('frontend', ['static', 'fallback', 'design', 'footer', 'nav']),
    ('security', ['auth', 'security', 'secret', 'isolation']),
    ('ops', ['layout', 'pattern', 'distribution', 'flow']),
    ('packages', ['package']),
]

# Category mappings for decisions/architecture/
DECISIONS_KEYWORDS = [
    ('database', ['db', 'cache', 'store', 'schema', 'neon', 'postgres', 'object-storage', 'jsonl']),
    ('compute', ['api', 'hono', 'rpc', 'worker', 'compute', 'route', 'billing-webhook', 'queue', 'distribution-and-queues', 'cron', 'tunnel']),
    ('frontend', ['footer', 'nav', 'sidebar', 'banner', 'chart', 'visual', 'satori', 'pwabuilder', 'linkroll', 'search-button', 'static-hosting', 'fallback']),
    ('ops', ['backup', 'mirror', 'cache', 'analytics', 'health-check', 'logs', 'better-stack', 'perf', 'speed', 'release', 'seo', 'time-tracking', 'build']),
    ('security', ['auth', 'security', 'secret', 'credential', 'payment', 'razorpay', 'donation', 'monetization', 'cross-site']),
    ('stack', ['stack', 'tool']),
    ('apps', ['scope', 'app', 'stats-page', 'ncert', 'janaushdhi']),
    ('content', ['blog', 'book', 'newsletter', 'feed', 'substack', 'journal', 'photo']),
    ('packages', ['package', 'publish', 'catalog']),
]

def get_new_path(file_path: Path) -> Path:
    """Determine the new path for a file based on its classification rules."""
    rel = file_path.relative_to(KNOWLEDGE_ROOT)
    parts = rel.parts
    
    if len(parts) < 2:
        return file_path
        
    l1 = parts[0]
    filename = parts[-1]
    
    # We only restructure files that are direct children of rules/, runbooks/, architecture/, or decisions/architecture/
    # If the file is already nested deeper, keep its current relative folder structure or refine it if it's Decisions
    if len(parts) == 2:
        if l1 == 'rules':
            if filename == 'index.md':
                return file_path
            for cat, kw_list in RULES_KEYWORDS:
                if any(kw in filename for kw in kw_list):
                    return KNOWLEDGE_ROOT / 'rules' / cat / filename
            return KNOWLEDGE_ROOT / 'rules' / 'interaction' / filename
            
        elif l1 == 'runbooks':
            if filename == 'index.md':
                return file_path
            for cat, kw_list in RUNBOOKS_KEYWORDS:
                if any(kw in filename for kw in kw_list):
                    return KNOWLEDGE_ROOT / 'runbooks' / cat / filename
            return KNOWLEDGE_ROOT / 'runbooks' / 'operations' / filename
            
        elif l1 == 'architecture':
            if filename == 'index.md':
                return file_path
            for cat, kw_list in ARCH_KEYWORDS:
                if any(kw in filename for kw in kw_list):
                    return KNOWLEDGE_ROOT / 'architecture' / cat / filename
            return KNOWLEDGE_ROOT / 'architecture' / 'general' / filename
            
    # For decisions/architecture/
    if l1 == 'decisions' and len(parts) >= 2:
        if parts[1] == 'architecture':
            if len(parts) == 3: # decisions/architecture/filename.md
                if filename == 'index.md':
                    return file_path
                for cat, kw_list in DECISIONS_KEYWORDS:
                    if any(kw in filename for kw in kw_list):
                        return KNOWLEDGE_ROOT / 'decisions' / 'architecture' / cat / filename
                return KNOWLEDGE_ROOT / 'decisions' / 'architecture' / 'general' / filename
                
    return file_path

def load_frontmatter(file_path: Path):
    """Load frontmatter from a markdown file."""
    if not file_path.exists():
        return {}, ""
    try:
        content = file_path.read_text(encoding='utf-8')
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                fm = yaml.safe_load(parts[1])
                return fm or {}, parts[2]
    except Exception as e:
        print(f"Error loading frontmatter from {file_path}: {e}")
    return {}, ""

def save_with_frontmatter(file_path: Path, frontmatter: dict, body: str):
    """Save markdown file with frontmatter."""
    file_path.parent.mkdir(parents=True, exist_ok=True)
    fm_str = yaml.dump(frontmatter, sort_keys=False, default_flow_style=False)
    content = f"---\n{fm_str}---\n{body}"
    file_path.write_text(content, encoding='utf-8')

def build_migration_map():
    """Build a mapping of old relative paths to new relative paths."""
    all_files = list(KNOWLEDGE_ROOT.glob("**/*.md"))
    mapping = {}
    for f in all_files:
        new_f = get_new_path(f)
        if new_f != f:
            old_rel = f.relative_to(KNOWLEDGE_ROOT).as_posix()
            new_rel = new_f.relative_to(KNOWLEDGE_ROOT).as_posix()
            mapping[old_rel] = new_rel
    return mapping

def update_links_in_content(content: str, source_rel_old: str, source_rel_new: str, mapping: dict) -> str:
    """Update relative markdown links and frontmatter cross-references in the content."""
    
    # 1. Update markdown links: [text](target)
    def link_replacer(match):
        label = match.group(1)
        target = match.group(2)
        
        # Split target into path and anchor
        if '#' in target:
            path_part, anchor_part = target.split('#', 1)
            anchor_part = '#' + anchor_part
        else:
            path_part = target
            anchor_part = ''
            
        # Ignore external links, mailto, etc.
        if path_part.startswith(('http://', 'https://', 'mailto:', 'tel:')):
            return match.group(0)
            
        # Resolve target relative to source_rel_old
        source_dir_old = Path(source_rel_old).parent
        
        # Target resolved path relative to knowledge/ root
        try:
            # target path can have forward or backward slashes
            path_parts = path_part.replace('\\', '/').split('/')
            resolved_parts = []
            for p in source_dir_old.parts + tuple(path_parts):
                if p == '..' and resolved_parts:
                    resolved_parts.pop()
                elif p != '.' and p != '..':
                    resolved_parts.append(p)
            resolved_rel = '/'.join(resolved_parts)
        except Exception:
            resolved_rel = path_part
            
        # Check if the resolved target path has been moved
        if resolved_rel in mapping:
            resolved_rel = mapping[resolved_rel]
            
        # Now compute the new relative path from source_rel_new to resolved_rel
        source_dir_new = Path(source_rel_new).parent
        target_path_obj = Path(resolved_rel)
        
        # Compute relative path
        try:
            # Find common prefix
            src_parts = source_dir_new.parts
            tgt_parts = target_path_obj.parts
            common_len = 0
            for s, t in zip(src_parts, tgt_parts):
                if s == t:
                    common_len += 1
                else:
                    break
            up_steps = len(src_parts) - common_len
            down_path = tgt_parts[common_len:]
            new_rel_parts = ['..'] * up_steps + list(down_path)
            new_relative_target = '/'.join(new_rel_parts)
            if not new_relative_target.startswith('.'):
                new_relative_target = './' + new_relative_target
        except Exception:
            new_relative_target = path_part
            
        return f"[{label}]({new_relative_target}{anchor_part})"
        
    content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link_replacer, content)
    return content

def update_frontmatter_related(fm: dict, mapping: dict) -> dict:
    """Update frontmatter 'related' fields with new paths."""
    if 'related' in fm and isinstance(fm['related'], list):
        new_related = []
        for r in fm['related']:
            # frontmatter references are e.g. "rules/self-update-rule" (no .md extension)
            r_with_ext = f"{r}.md"
            if r_with_ext in mapping:
                new_r_with_ext = mapping[r_with_ext]
                # Strip .md
                new_related.append(new_r_with_ext[:-3])
            else:
                new_related.append(r)
        fm['related'] = new_related
    return fm

def generate_index_files():
    """Automatically generate or update index.md files for directories in knowledge/."""
    # Find all directories that contain markdown files directly (excluding index.md)
    for root, dirs, files in os.walk(str(KNOWLEDGE_ROOT)):
        root_path = Path(root)
        md_files = [f for f in files if f.endswith('.md') and f != 'index.md']
        sub_dirs = [d for d in dirs if not d.startswith(('.', '_'))]
        
        if not md_files and not sub_dirs:
            continue
            
        index_file = root_path / 'index.md'
        rel_dir = root_path.relative_to(KNOWLEDGE_ROOT).as_posix()
        
        # Determine title
        dir_name = root_path.name.replace('-', ' ').title()
        if rel_dir == '.':
            dir_name = "Oriz Family Knowledge Bundle"
            
        # Build contents listing
        body = f"\n# {dir_name}\n\n"
        
        if sub_dirs:
            body += "## Categories\n\n"
            for sd in sorted(sub_dirs):
                sd_title = sd.replace('-', ' ').title()
                body += f"- [{sd_title}](./{sd}/index.md)\n"
            body += "\n"
            
        if md_files:
            body += "## Concepts\n\n"
            concepts = []
            for mf in sorted(md_files):
                fm, _ = load_frontmatter(root_path / mf)
                title = fm.get('title', mf.replace('.md', '').replace('-', ' ').title())
                desc = fm.get('description', 'No description available.')
                concepts.append((title, mf, desc))
                
            for title, filename, desc in concepts:
                body += f"- [{title}](./{filename}) — {desc}\n"
                
        # Frontmatter
        fm = {
            'type': 'index',
            'title': dir_name,
            'description': f"Index of concepts in {rel_dir if rel_dir != '.' else 'knowledge/'}.",
            'tags': ['index', root_path.name] if rel_dir != '.' else ['okf', 'index', 'family'],
            'timestamp': '2026-06-24',
            'format_version': 'okf-v0.1',
            'status': 'active'
        }
        
        save_with_frontmatter(index_file, fm, body)
        print(f"Generated index.md for {rel_dir}")

def update_root_pointers(mapping: dict):
    """Update links in the root markdown files that point to moved knowledge files."""
    root_files = [
        REPO_ROOT / 'AGENTS.md',
        REPO_ROOT / 'CLAUDE.md',
        REPO_ROOT / 'GEMINI.md',
        REPO_ROOT / 'COPILOT.md',
        REPO_ROOT / 'CURSOR.md',
        REPO_ROOT / 'AIDER.md',
        REPO_ROOT / 'README.md',
        REPO_ROOT / 'knowledge.md'
    ]
    
    for rf in root_files:
        if not rf.exists():
            continue
        print(f"Updating pointers in root file: {rf.name}")
        content = rf.read_text(encoding='utf-8')
        
        # Link replacer specifically for root files
        # Root files link to e.g. "./knowledge/rules/self-update-rule.md" or "knowledge/rules/self-update-rule.md"
        def root_link_replacer(match):
            label = match.group(1)
            target = match.group(2)
            
            # Split target path and anchor
            if '#' in target:
                path_part, anchor_part = target.split('#', 1)
                anchor_part = '#' + anchor_part
            else:
                path_part = target
                anchor_part = ''
                
            # Strip leading ./ or /
            clean_path = path_part.lstrip('./')
            if clean_path.startswith('knowledge/'):
                know_path = clean_path[len('knowledge/'):]
                if know_path in mapping:
                    new_target = f"./knowledge/{mapping[know_path]}"
                    return f"[{label}]({new_target}{anchor_part})"
                    
            return match.group(0)
            
        new_content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', root_link_replacer, content)
        rf.write_text(new_content, encoding='utf-8')

def main():
    print("Building migration map...")
    mapping = build_migration_map()
    print(f"Found {len(mapping)} files to migrate.")
    
    # Read all files first before moving them (so we don't lose contents)
    file_contents = {}
    for old_rel, new_rel in mapping.items():
        old_path = KNOWLEDGE_ROOT / old_rel
        fm, body = load_frontmatter(old_path)
        file_contents[old_rel] = (fm, body)
        
    print("Moving and updating migrated files...")
    # Move files and write updated contents
    for old_rel, new_rel in mapping.items():
        old_path = KNOWLEDGE_ROOT / old_rel
        new_path = KNOWLEDGE_ROOT / new_rel
        
        # Create directories
        new_path.parent.mkdir(parents=True, exist_ok=True)
        
        fm, body = file_contents[old_rel]
        
        # Update links in body
        new_body = update_links_in_content(body, old_rel, new_rel, mapping)
        # Update frontmatter related field
        new_fm = update_frontmatter_related(fm, mapping)
        
        save_with_frontmatter(new_path, new_fm, new_body)
        
        # Delete old file
        if old_path.exists():
            old_path.unlink()
            
    print("Updating links in unmoved files...")
    # Update links in remaining files that were not moved
    all_files = list(KNOWLEDGE_ROOT.glob("**/*.md"))
    for f in all_files:
        rel = f.relative_to(KNOWLEDGE_ROOT).as_posix()
        # Skip index.md (we will regenerate it)
        if f.name == 'index.md':
            continue
        # Read, rewrite, and save
        fm, body = load_frontmatter(f)
        new_body = update_links_in_content(body, rel, rel, mapping)
        new_fm = update_frontmatter_related(fm, mapping)
        save_with_frontmatter(f, new_fm, new_body)
        
    print("Regenerating directory indexes...")
    generate_index_files()
    
    print("Updating root file pointers...")
    update_root_pointers(mapping)
    
    print("Restructuring completed successfully!")

if __name__ == "__main__":
    main()
