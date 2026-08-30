with open('labs/CrossSiteScripting9.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace('Visitor Screen', 'Social Media Feed')
code = code.replace('SESSION KEY', 'LOGIN TOKEN')
code = code.replace('BROWSER HIJACKED', 'ACCOUNT COMPROMISED')
code = code.replace(
    'message="Application Secured! The HTML Entity Encoder neutralized the malicious tags, preventing the browser from executing the injected code."', 
    'message="Application Secured! The HTML Entity Encoder neutralized the malicious tags. The Golden Rule of Web Security: NEVER trust user input!"'
)

clamp_html = '''                            </button>
                        </div>
                        <div className="text-[10px] text-blue-500/80 font-bold max-w-[240px] text-center leading-tight mt-1">
                            {sanitizerMode === "ENCODE" ? "Translates code commands into harmless text." : "Allows raw commands through."}
                        </div>'''

code = code.replace('                            </button>\n                        </div>', clamp_html, 1)

with open('labs/CrossSiteScripting9.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
