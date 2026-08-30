with open('labs/CrossSiteScripting9.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

bad_html = """                        <div className="text-[10px] text-blue-500/80 font-bold max-w-[240px] text-center leading-tight mt-1">
                            {sanitizerMode === "ENCODE" ? "Translates code commands into harmless text." : "Allows raw commands through."}
                        </div>"""

code = code.replace(bad_html + '\n', '')
code = code.replace(bad_html, '') # just in case

good_hook = """                                ENCODE ENTITIES
                            </button>
                        </div>"""

good_html = good_hook + '\n' + bad_html

code = code.replace(good_hook, good_html)

with open('labs/CrossSiteScripting9.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
