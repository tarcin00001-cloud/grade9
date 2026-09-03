import json
import os

log_file = 'C:/Users/LocalAdmin/.gemini/antigravity/brain/b51e3fd4-c0aa-4065-8ab5-c670014c9f96/.system_generated/logs/transcript_full.jsonl'
target = 'NetworkInterface31.tsx'

content = ""

with open(log_file, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if 'tool_calls' in data and len(data['tool_calls']) > 0:
                call = data['tool_calls'][0]
                if call['name'] == 'write_to_file':
                    args = call['args']
                    if target in args.get('TargetFile', ''):
                        # Found the initial or full write
                        content = args['CodeContent'].replace('\r\n', '\n')
                        print("Found write_to_file, resetting content.")
                
                elif call['name'] == 'replace_file_content':
                    args = call['args']
                    if target in args.get('TargetFile', ''):
                        target_content = args['TargetContent'].replace('\r\n', '\n')
                        replacement = args['ReplacementContent'].replace('\r\n', '\n')
                        
                        if target_content in content:
                            content = content.replace(target_content, replacement)
                            print(f"Applied patch: {args.get('Instruction', '')}")
                        else:
                            print(f"Failed exact patch: {args.get('Instruction', '')}")
                            # fallback: strip whitespace
                            target_stripped = target_content.strip()
                            if target_stripped in content:
                                content = content.replace(target_stripped, replacement.strip())
                                print(f"Applied patch (fallback): {args.get('Instruction', '')}")

        except Exception as e:
            pass

with open('labs/NetworkInterface31.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Reconstructed file size: {len(content)} bytes")
