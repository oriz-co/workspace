import os
import re
from pathlib import Path

KNOWLEDGE_ROOT = Path("c:/D/oriz/knowledge").resolve()
REPO_ROOT = Path("c:/D/oriz").resolve()

def build_filename_map():
    """Build a mapping from filename to relative path from knowledge/ root."""
    file_map = {}
    for r, d, files in os.walk(str(KNOWLEDGE_ROOT)):
        for f in files:
            if f.endswith('.md'):
                rel_path = Path(r) / f
                know_rel = rel_path.relative_to(KNOWLEDGE_ROOT).as_posix()
                file_map[f] = know_rel
    return file_map

def fix_links_in_file(file_path: Path, file_map: dict) -> int:
    """Fix any broken relative markdown links in a file."""
    content = file_path.read_text(encoding='utf-8')
    rel_source = file_path.relative_to(KNOWLEDGE_ROOT if file_path.is_relative_to(KNOWLEDGE_ROOT) else REPO_ROOT).as_posix()
    source_dir = file_path.parent
    
    modified = False
    fixed_count = 0
    
    def link_replacer(match):
        nonlocal fixed_count, modified
        label = match.group(1)
        target = match.group(2)
        
        if target.startswith(('http://', 'https://', 'mailto:', 'tel:')):
            return match.group(0)
            
        # Split path and anchor
        if '#' in target:
            path_part, anchor_part = target.split('#', 1)
            anchor_part = '#' + anchor_part
        else:
            path_part = target
            anchor_part = ''
            
        if not path_part:
            return match.group(0)
            
        # Check if resolved path exists
        resolved = (source_dir / path_part).resolve()
        if resolved.exists() and resolved.is_file():
            return match.group(0)
            
        # Link is broken! Let's try to fix it using filename map
        target_filename = Path(path_part).name
        
        # If it's a relative link to a file we know, let's fix it
        if target_filename in file_map:
            correct_rel_target = file_map[target_filename]
            target_path_obj = KNOWLEDGE_ROOT / correct_rel_target
            
            # Compute correct relative path from source_dir to target_path_obj
            try:
                # Find common prefix
                src_parts = source_dir.parts
                tgt_parts = target_path_obj.parent.parts
                common_len = 0
                for s, t in zip(src_parts, tgt_parts):
                    if s == t:
                        common_len += 1
                    else:
                        break
                up_steps = len(src_parts) - common_len
                down_path = tgt_parts[common_len:] + (target_path_obj.name,)
                new_rel_parts = ['..'] * up_steps + list(down_path)
                new_relative_target = '/'.join(new_rel_parts)
                if not new_relative_target.startswith('.'):
                    new_relative_target = './' + new_relative_target
                    
                fixed_count += 1
                modified = True
                print(f"Fixed link in {rel_source}: {target} -> {new_relative_target}{anchor_part}")
                return f"[{label}]({new_relative_target}{anchor_part})"
            except Exception as e:
                print(f"Failed to resolve new relative path for {target_filename} in {rel_source}: {e}")
                
        return match.group(0)
        
    new_content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link_replacer, content)
    if modified:
        file_path.write_text(new_content, encoding='utf-8')
        
    return fixed_count

def main():
    print("Building filename map...")
    file_map = build_filename_map()
    print(f"Found {len(file_map)} concept files in knowledge base.")
    
    total_fixed = 0
    # Scan all markdown files in knowledge/
    for r, d, files in os.walk(str(KNOWLEDGE_ROOT)):
        for f in sorted(files):
            if f.endswith('.md'):
                file_path = Path(r) / f
                total_fixed += fix_links_in_file(file_path, file_map)
                
    # Also check root files
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
        if rf.exists():
            # Adjust mapping lookup for root files (rel path from repo root)
            # Create a custom map with knowledge/ prefix
            root_file_map = {name: f"knowledge/{path}" for name, path in file_map.items()}
            total_fixed += fix_links_in_file(rf, root_file_map)
            
    print(f"Link fixing complete. Total links fixed: {total_fixed}")

if __name__ == "__main__":
    main()
