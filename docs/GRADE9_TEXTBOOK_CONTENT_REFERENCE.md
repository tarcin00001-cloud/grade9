# Grade 9 Textbook Content Reference

## Source and purpose

- **Book:** *Computing Level 09 — Quantum Leaps in Tech*
- **Edition:** First Edition, 2026
- **Source PDF:** `Computing Level-09-Quantum Leaps in Tech.pdf`
- **PDF length:** 196 pages
- **Purpose:** Canonical content reference for designing, reviewing, and validating Grade 9 interactive labs.
- **Scope:** The 48 numbered textbook lessons, the term project, recurring assessments, and the final assessment.

This file paraphrases the textbook for internal curriculum alignment. It does not reproduce the book verbatim. Printed page numbers are the numbers shown inside the book. PDF page numbers refer to the PDF viewer and are generally printed page + 11.

## How future developers and reviewers should use this file

For a lab associated with a textbook lesson:

1. Use the lesson's **core content** as the conceptual boundary.
2. Convert the **student outcome** into observable interaction and assessment evidence.
3. Use the **book activity direction** as inspiration, not necessarily as the final interface.
4. Apply every requirement in `AGENTS.md`, especially feedback, visible outcome, assessment, accessibility, reset, LMS completion, responsive layout, and technical quality.
5. Do not treat technical implementation choices as curriculum requirements unless the lesson explicitly teaches those choices.
6. Fact-check historical statistics, product claims, security guidance, and fast-changing technology before publishing a lab.

Recommended lab flow:

> Learn → Try → Fail safely → Understand why → Improve → Complete → See the outcome

## Curriculum-wide learning intent

The book expects Grade 9 learners to move beyond basic digital literacy and begin reasoning like computing practitioners. Across the year, learners should be able to:

- Select and implement suitable data structures and algorithms.
- Explain how hardware, operating systems, and networks process information.
- Use object-oriented programming concepts in Java and Python.
- Understand professional software engineering practices: requirements, architecture, version control, IDEs, and testing.
- Explain modern AI methods and evaluate their educational and ethical effects.
- Analyze cybersecurity incidents, defenses, privacy tools, and professional responsibilities.
- Connect computing with music, biology, medicine, environment, economics, and accessibility.
- Evaluate technological innovation using technical, social, ethical, and economic perspectives.
- Build a substantial project and communicate evidence-based decisions.

## Textbook structure

The book places a short assessment after Lessons 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, and 44. Lesson 39 is a four-week project worth 10% of the stated final mark. A final assessment follows Lesson 48.

## Lesson-by-lesson reference

### Lessons 1–4: Foundations, history, citizenship, and requirements

#### 01. Data Structures

- **Pages:** Printed 1–3; PDF 12–14
- **Category:** Introduction to Computing Terms
- **Core content:** Arrays, dynamic lists and linked lists, stacks using LIFO with push/pop, queues using FIFO with enqueue/dequeue, trees and hierarchical organization, and choosing a structure according to access, insertion, deletion, or hierarchy needs.
- **Student outcome:** Distinguish the structures, simulate their operations, and justify which structure suits a given problem.
- **Book activity direction:** Physically simulate stack, queue, and array operations using labelled cards.
- **Current tracker alignment:** No direct corresponding lab at tracker position 1; the current first lab is CDN architecture.

#### 02. UNIVAC

- **Pages:** Printed 4–7; PDF 15–18
- **Category:** Ancient Gadgets
- **Core content:** UNIVAC I as an early commercial computer; vacuum-tube processing, magnetic-tape storage, mercury memory, printing, physical size, cost, heat, the US Census, and the 1952 election prediction.
- **Student outcome:** Explain how UNIVAC processed data and compare its scale, speed, storage, and impact with modern computing.
- **Book activity direction:** Compare modern election prediction with UNIVAC and create a class-survey prediction using simple statistics.
- **Current lab:** `univac9` — direct alignment.

#### 03. Digital Ethics in Communities

- **Pages:** Printed 8–10; PDF 19–21
- **Category:** Digital Citizenship
- **Core content:** Integrity, accountability, empathy, free speech versus safe spaces, privacy versus security, individual rights versus collective good, transparent moderation, due process, proportionality, community charters, inclusive governance, and restorative justice.
- **Student outcome:** Identify stakeholders and competing values, apply ethical principles, defend a balanced decision, and help define fair community rules.
- **Book activity direction:** Ethics committee deliberation and collaborative creation of an online-community constitution.
- **Current tracker alignment:** No direct lab; `csrfattacks9` occupies tracker position 3 and does not cover this lesson.

#### 04. Requirements and Analysis

- **Pages:** Printed 11–13; PDF 22–24
- **Category:** Software and Software Engineering
- **Core content:** Requirements elicitation, structured interviews, user-story workshops, prototyping, stakeholder analysis, functional versus measurable non-functional requirements, implicit requirements, scenario analysis, edge cases, collaboration, and traceability from stories to tasks, tests, and deployment criteria. Jira is presented as the professional context.
- **Student outcome:** Elicit stakeholder needs, identify implicit requirements, classify functional/non-functional requirements, write precise user stories, and trace them to acceptance evidence.
- **Book activity direction:** Conduct interviews and scenario workshops for a school-management app, document Jira-style user stories, and present findings to stakeholders.
- **Current lab:** `requirementsanalysis9` — direct topic, but it should assess elicitation and traceability as well as classification.

### Lessons 5–8: Programming, AI, creative computing, and innovation

#### 05. Classes in Java

- **Pages:** Printed 14–17; PDF 25–28
- **Category:** Computer Languages
- **Core content:** Classes as blueprints, objects as instances, attributes, constructors, methods, `this`, encapsulation using private fields, getters/setters, validation, and creating multiple independent objects.
- **Student outcome:** Read, complete, and reason about a Java class; instantiate objects; predict object state; and explain encapsulation.
- **Book activity direction:** Build and test a small class such as `Student`, including controlled updates through methods.
- **Current lab:** `classesinjava9` — direct alignment.

#### 06. Deep Learning Basics

- **Pages:** Printed 18–21; PDF 29–32
- **Category:** AI and Applications of AI
- **Core content:** Deep versus shallow neural networks, layers and hierarchical representation, weights and biases, activation functions, forward processing, loss, gradient descent, backpropagation, CNNs, sequence models, transformers, attention, optimization, and large parameter counts.
- **Student outcome:** Trace information through layers, explain how training changes weights to reduce error, and distinguish major deep-learning architectures by use.
- **Book activity direction:** Human multi-layer neural-network simulation and design of a simple image-classification network.
- **Current lab:** `deeplearning9` — direct alignment.

#### 07. Algorithmic Music Composition

- **Pages:** Printed 22–24; PDF 33–35
- **Category:** Computing in Various Fields
- **Core content:** Rule-based composition, mathematical sequences and patterns, machine-learning generation from musical datasets, generative tools, creativity, authorship, aesthetics, and the relationship between algorithms and human composers.
- **Student outcome:** Translate a mathematical rule into melody/rhythm, modify parameters, compare generated and human-created music, and discuss authorship responsibly.
- **Book activity direction:** Compose using a mathematical pattern and hold a blind algorithm-versus-human listening challenge.
- **Current lab:** `algorithmicmusic9` — direct alignment.

#### 08. Elon Musk

- **Pages:** Printed 25–27; PDF 36–38
- **Category:** Inventors and Innovators
- **Core content:** Brain-computer interfaces, Neuralink's neural threads, reading and stimulating neural activity, medical applications, bandwidth limits of keyboards/screens, human-AI symbiosis, surgical challenges, and ethical concerns.
- **Student outcome:** Explain the BCI signal path, compare interface bandwidths, identify medical possibilities and risks, and evaluate the broader human-AI vision.
- **Book activity direction:** Compare communication-interface bandwidth and discuss technical and ethical trade-offs.
- **Current lab:** `braincomputerinterface9` — strong thematic alignment.

### Lessons 9–12: Hardware, infrastructure failures, adaptive devices, and search

#### 09. Graphics Processing Units

- **Pages:** Printed 28–30; PDF 39–41
- **Category:** Hardware
- **Core content:** CPU low-latency sequential work versus GPU high-throughput parallel work, thousands of simpler cores, SIMD-style execution, streaming multiprocessors, memory bandwidth, graphics rendering, AI, scientific simulation, and workloads that do or do not parallelize well.
- **Student outcome:** Predict whether a workload benefits from CPU or GPU execution and explain speedup, bottlenecks, and parallel structure.
- **Book activity direction:** Compare small teams doing complex sequential work with large teams doing uniform parallel work.
- **Current lab:** `gpu9` — direct alignment.

#### 10. The Cloudflare DNS Outage

- **Pages:** Printed 31–33; PDF 42–44
- **Category:** Case Studies
- **Core content:** The July 2, 2019 Cloudflare outage; a WAF regular expression with catastrophic backtracking; CPU saturation; cascading global impact; algorithmic complexity; configuration risk; staged rollout; monitoring; rollback; and critical infrastructure concentration.
- **Student outcome:** Explain how one inefficient rule caused global failure, recognize exponential behavior, and design a safer deployment pipeline.
- **Book activity direction:** Analyze regex performance and create a progressive rollout, monitoring, and rollback flow.
- **Current lab:** `cloudflare9` — related, but it should preserve the outage's regex/CPU and deployment-safety learning.

#### 11. The Foldable Smartphone

- **Pages:** Printed 34–36; PDF 45–47
- **Category:** Modern Gadgets
- **Core content:** Flexible OLED displays, hinge engineering, folded and unfolded modes, multitasking, adaptive interfaces, durability testing, responsive application layouts, and new interaction possibilities.
- **Student outcome:** Explain the hardware/software coordination and design a layout that adapts meaningfully across device postures.
- **Book activity direction:** Investigate flexible-display engineering and propose a transforming device for several activities.
- **Current lab:** `foldablesmartphone11` — direct alignment.

#### 12. Advanced Searching Methods

- **Pages:** Printed 37–39; PDF 48–50
- **Category:** Data and Information
- **Core content:** Binary search on sorted data, midpoint comparisons, halving the search space, termination, comparison with linear search, and logarithmic complexity.
- **Student outcome:** Trace binary search correctly, count comparisons, explain the sorted-data precondition, and compare O(log n) with O(n).
- **Book activity direction:** Trace array searches and play an optimal higher/lower number-guessing game.
- **Current lab:** `binarysearch12` — direct alignment.

### Lessons 13–16: Privacy, memory, Python OOP, and cloud transformation

#### 13. Advanced Privacy Techniques

- **Pages:** Printed 40–43; PDF 51–54
- **Category:** Digital Citizenship
- **Core content:** Hardware security keys, authenticator apps, weaknesses of SMS codes, VPN tunnels and limitations, password managers, end-to-end encrypted messaging, layered defense, threat-based tool selection, and privacy/convenience trade-offs.
- **Student outcome:** Select appropriate privacy defenses for specific threats and explain both their protections and limitations.
- **Book activity direction:** Implement and audit several privacy tools; defend scenarios involving phishing, weak passwords, public Wi-Fi, and message interception.
- **Current tracker alignment:** `asymmetriccrypto9` is adjacent but not a complete replacement for this privacy lesson.

#### 14. Virtual Memory in OS (Windows Server)

- **Pages:** Printed 44–46; PDF 55–57
- **Category:** Operating Systems and Networking
- **Core content:** Physical RAM, page/swap files, paging out and paging in, page selection, disk/SSD latency, thrashing, private address spaces, and memory protection.
- **Student outcome:** Simulate page replacement, explain performance degradation, and distinguish capacity extension from actual RAM speed.
- **Book activity direction:** Manage program cards between limited desk space (RAM) and slower storage (virtual memory).
- **Current lab:** `virtualmem9` — direct alignment.

#### 15. OOP in Python

- **Pages:** Printed 47–52; PDF 58–63
- **Category:** Computer Languages
- **Core content:** Python classes, `__init__`, `self`, attributes and methods, `__str__`, naming conventions for encapsulation, validation, inheritance, method overriding, `super()`, comparison with Java, and operator overloading.
- **Student outcome:** Construct and use Python objects, trace inheritance and overrides, protect state through methods, and implement meaningful special methods.
- **Book activity direction:** Implement classes such as `Student`, `BankAccount`, and related parent/child models.
- **Current lab:** `ooppython15` — direct alignment.

#### 16. Satya Nadella

- **Pages:** Printed 53–55; PDF 64–66
- **Category:** Inventors and Innovators
- **Core content:** Microsoft's shift from PC software licensing toward Azure and cloud services, Office 365, cross-platform collaboration, cloud-first/mobile-first strategy, organizational culture, partnerships, disruption, and business-model transformation.
- **Student outcome:** Analyze why an established company needed transformation and make defensible investment, partnership, and platform decisions under disruption.
- **Book activity direction:** Run a strategy simulation for a company facing a major technology shift.
- **Current lab:** `cloudstrategy16` — strong alignment.

### Lessons 17–20: Networks, support careers, AGI, and CDN resilience

#### 17. Networking Protocols

- **Pages:** Printed 56–58; PDF 67–69
- **Category:** Introduction to Computing Terms
- **Core content:** IP addressing and routing, packets, IPv4/IPv6, TCP reliability and the three-way handshake, retransmission, HTTP requests/responses and methods, DNS resolution, status codes, TCP versus UDP, protocol layering, FTP, SMTP, and ICMP.
- **Student outcome:** Trace a web request from domain lookup to response and assign each protocol its correct responsibility.
- **Book activity direction:** Diagram DNS → TCP handshake → HTTP request/response and act out protocol operations.
- **Current tracker alignment:** No direct lesson; `hashfunctions9` occupies tracker position 17.

#### 18. Meet the IT Support Specialist!

- **Pages:** Printed 59–60; PDF 70–71
- **Category:** Jobs in Computing
- **Core content:** Troubleshooting, network connectivity, operating-system administration, security updates, patch management, firewalls, antivirus, authentication, user support, escalation, collaboration, cybersecurity hygiene, and balancing security with convenience.
- **Student outcome:** Diagnose common incidents systematically, prioritize fixes, communicate with users, and explain essential security practices.
- **Book activity direction:** Write a practical cybersecurity guide showing how IT support implements protections in schools/offices.
- **Current lab:** `itsupport18` — direct alignment.

#### 19. AGI Prospects

- **Pages:** Printed 61–63; PDF 72–74
- **Category:** Future of Computing
- **Core content:** AGI versus narrow AI, flexible cross-domain reasoning, transfer learning, meta-learning, multimodal systems, neural architecture search, neurosymbolic methods, creativity, alignment, control, power concentration, uncertain timelines, and possible benefits.
- **Student outcome:** Distinguish AGI from current specialized AI, evaluate evidence and uncertainty, and reason about governance and social consequences.
- **Book activity direction:** Conduct an AGI interview across diverse domains and debate whether development should accelerate or slow.
- **Current lab:** `agiinterview19` — direct alignment.

#### 20. The Fastly CDN Failure

- **Pages:** Printed 64–66; PDF 75–77
- **Category:** Case Studies
- **Core content:** The June 8, 2021 Fastly outage; a latent bug triggered by a valid customer configuration; widespread 503 errors; CDN caching and proximity; dependency concentration; incident timeline; rollback; redundancy; multi-CDN design; monitoring; and failover.
- **Student outcome:** Explain CDN benefits and systemic risk, identify a single point of failure, and design/test resilient delivery architecture.
- **Book activity direction:** Draw primary/backup CDN topology with automatic failover and explain how it changes the incident outcome.
- **Current tracker alignment:** No direct lesson; `sshkeys9` occupies tracker position 20.

### Lessons 21–24: Architecture, educational AI, responsible AI, and algorithms

#### 21. Design Patterns in Software

- **Pages:** Printed 67–69; PDF 78–80
- **Category:** Software and Software Engineering
- **Core content:** Separation of concerns, single responsibility, dependency inversion, maintainability, scalability, performance-versus-simplicity trade-offs, UML class/sequence/system diagrams, MVC, layered architecture, microservices, and established patterns as reusable solutions.
- **Student outcome:** Decompose a system, select a suitable pattern, visualize relationships, and justify trade-offs rather than merely naming a pattern.
- **Book activity direction:** Design and review a system architecture using UML-style diagrams.
- **Current tracker alignment:** No direct lesson; `symmetriccrypto9` occupies tracker position 21.

#### 22. AI in Education

- **Pages:** Printed 70–73; PDF 81–84
- **Category:** AI and Applications of AI
- **Core content:** Adaptive learning, individualized paths, collaborative filtering, intelligent tutoring, automated assessment, NLP essay analysis, student modelling, Bayesian Knowledge Tracing, Item Response Theory, clustering, learning analytics, recommendation, progress monitoring, and personalization.
- **Student outcome:** Design an adaptive loop that uses evidence to estimate mastery and choose a suitable next activity while recognizing limits and fairness concerns.
- **Book activity direction:** Build concepts for an adaptive quiz generator, learning-path optimizer, or personalized feedback system.
- **Current lab:** `aieducation22` — direct alignment.

#### 23. Responsible AI and Tech Use

- **Pages:** Printed 74–77; PDF 85–88
- **Category:** Digital Citizenship
- **Core content:** Machine learning, NLP, computer vision, generative AI, bias and discrimination, privacy and surveillance, misinformation/deepfakes, transparency, accountability, human oversight, stakeholder impact, and responsible creation/use.
- **Student outcome:** Detect ethical risks in scenarios, identify harmed stakeholders, question apparently neutral outputs, and propose safeguards with reasoning.
- **Book activity direction:** Analyze case studies and conduct structured debates on bias, surveillance, deepfakes, autonomous systems, and educational integrity.
- **Current lab:** `responsibleai23` — direct alignment.

#### 24. Advanced Algorithms

- **Pages:** Printed 78–88; PDF 89–99
- **Category:** Computer Languages / Algorithms
- **Core content:** The lesson develops algorithmic thinking through searching, sorting, graph traversal, recursion/divide-and-conquer, implementation traces, correctness, and time-complexity comparison. Current lab alignment should specifically verify which algorithms from the lesson are represented.
- **Student outcome:** Trace algorithm state step-by-step, select an algorithm for a data shape, compare efficiency, and explain why an output is correct.
- **Book activity direction:** Implement, trace, and compare algorithms rather than only viewing completed animations.
- **Current lab:** `advancedalgorithms24` — direct alignment; verify coverage against the source lesson.

### Lessons 25–28: Standards, security, set logic, and Colossus

#### 25. Ajay Bhatt

- **Pages:** Printed 89–91; PDF 100–102
- **Category:** Inventors and Innovators
- **Core content:** Incompatible peripheral connectors, industry cooperation, USB as a universal standard, shared physical connector, data and power protocols, automatic device recognition, accessibility, ecosystem effects, and standards trade-offs.
- **Student outcome:** Explain why a standard needs both technical design and industry adoption and negotiate compatibility requirements among stakeholders.
- **Book activity direction:** Develop a standard from conflicting device/vendor needs and test it with a compatibility matrix.
- **Current lab:** `usbconnectivity25` — direct alignment.

#### 26. Firewall and Security

- **Pages:** Printed 92–93; PDF 103–104
- **Category:** Operating Systems and Networking
- **Core content:** Firewalls as traffic-control systems, allow/deny rules, packet headers, IP addresses, ports, protocols, inbound/outbound traffic, hardware versus software firewalls, stateful inspection, deep packet inspection, logging, and defense limitations.
- **Student outcome:** Evaluate packets against a rule set, explain allowed/blocked decisions, and improve protection without blocking necessary services.
- **Book activity direction:** Operate a classroom security checkpoint using packet cards and firewall rules.
- **Current tracker alignment:** No direct lesson; `machinelearning9` occupies tracker position 26.

#### 27. Sets and Venn Diagrams

- **Pages:** Printed 94–98; PDF 105–109
- **Category:** Math and Logic
- **Core content:** Sets, elements, cardinality, empty/universal/finite/infinite sets, subsets, union, intersection, difference, complement, Venn diagrams, database/search applications, deduplication, and inclusion-exclusion reasoning.
- **Student outcome:** Translate real situations into set notation, calculate operations, interpret Venn regions, and connect set operations to filtering/query logic.
- **Book activity direction:** Collect class-interest data, build Venn diagrams, and answer compound set questions.
- **Current lab:** `setsandvenn27` — direct alignment.

#### 28. Colossus

- **Pages:** Printed 99–103; PDF 110–114
- **Category:** Ancient Gadgets
- **Core content:** Tommy Flowers, Bletchley Park, Lorenz-code analysis, high-speed paper tape, vacuum tubes, Boolean operations, systematic key testing, programmable electronic processing, parallelism, wartime secrecy, operators, historical impact, and modern cryptanalysis connections.
- **Student outcome:** Explain the data path and systematic search, operate a simplified cipher-analysis process, and evaluate the machine's historical and ethical context.
- **Book activity direction:** Create and systematically decode simple ciphers; research links to modern cybersecurity.
- **Current lab:** `colossus28` — direct alignment.

### Lessons 29–32: Biological data, blockchain security, NICs, and wearables

#### 29. Big Data in Biological Research

- **Pages:** Printed 104–106; PDF 115–117
- **Category:** Computing in Various Fields
- **Core content:** Genomic and ecological datasets, bioinformatics databases, DNA-sequence comparison, phylogenetic trees, machine-learning pattern discovery, multi-source data integration, disease/genetic markers, biodiversity, conservation, and genetic-data ethics.
- **Student outcome:** Compare biological records computationally, interpret similarity/relationship evidence, and explain both scientific value and ethical risk.
- **Book activity direction:** Analyze simplified DNA sequences, construct a phylogenetic tree, or investigate biodiversity using datasets.
- **Current tracker alignment:** No direct lesson; `passwordcracking9` occupies tracker position 29.

#### 30. The Ethereum DAO Hack

- **Pages:** Printed 107–109; PDF 118–120
- **Category:** Case Studies
- **Core content:** The DAO, smart contracts, token voting, reentrancy caused by sending value before updating state, recursive withdrawals, the 2016 loss, child DAO delay, Ethereum hard fork, immutability versus community intervention, governance, and secure contract ordering.
- **Student outcome:** Trace the vulnerable state transition, fix checks-effects-interactions ordering, and defend a governance position using technical and ethical evidence.
- **Book activity direction:** Audit simplified contract logic and debate the hard-fork decision.
- **Current lab:** `ethereumdao9` — direct alignment.

#### 31. Network Interface Cards

- **Pages:** Printed 110–112; PDF 121–123
- **Category:** Hardware
- **Core content:** NICs across physical and data-link layers, electrical/optical/radio signaling, frames, MAC addressing, error detection, buffering, Ethernet, Wi-Fi MIMO, beamforming, OFDM, offloading, throughput, latency, and interface choice.
- **Student outcome:** Trace data through a NIC/protocol stack and select wired/wireless interfaces based on bandwidth, latency, mobility, and reliability needs.
- **Book activity direction:** Compare Ethernet, Wi-Fi 6, and 5G and act out layered packet handling.
- **Current lab:** `networkinterface31` — direct alignment.

#### 32. The Smart Ring

- **Pages:** Printed 113–115; PDF 124–126
- **Category:** Modern Gadgets
- **Core content:** Miniaturized wearable computing, biometric sensors, continuous monitoring, low-power processing, battery constraints, payments, access control, gestures, illness-pattern detection, waterproofing, privacy, and medical possibilities.
- **Student outcome:** Balance sensor value, power, size, privacy, accuracy, and user benefit when designing a wearable system.
- **Book activity direction:** Design a health/daily-life smart ring and investigate healthcare applications.
- **Current lab:** `smartring32` — direct alignment.

### Lessons 33–36: Development workflow, IDE collaboration, structures, and visualization

#### 33. Software Development

- **Pages:** Printed 116–119; PDF 127–130
- **Category:** Introduction to Computing Terms
- **Core content:** Planning, coding, debugging syntax/logic/runtime errors, compiling versus interpreting, version control, repositories, commits, branches, merges, collaboration, IDEs, deployment, maintenance, and CI/CD.
- **Student outcome:** Diagnose errors systematically and use a basic version-control workflow to develop and maintain a small program.
- **Book activity direction:** Debug intentionally broken code and document a Git branch/commit/merge exercise.
- **Current tracker alignment:** No direct lesson; `maninthemiddle9` occupies tracker position 33.

#### 34. Implementation with IDEs

- **Pages:** Printed 120–122; PDF 131–133
- **Category:** Software and Software Engineering
- **Core content:** Visual Studio Code, distributed Git, branches, commits, push, merge, conflicts, complete local history, code review, pull requests, continuous integration, release branches, bisection, and collaborative workflow.
- **Student outcome:** Execute and explain a professional feature-branch workflow, including review and conflict handling.
- **Book activity direction:** Collaboratively build a small web application through feature branches, pull requests, review, and merge.
- **Current tracker alignment:** No direct lesson; `ransomware9` occupies tracker position 34.

#### 35. Data Structures Introduction

- **Pages:** Printed 123–133; PDF 134–144
- **Category:** Computer Languages
- **Core content:** Implementation of stacks, queues, linked lists, hash tables, and binary trees; operations; practical applications such as balanced parentheses; Python/Java examples; and complexity comparison for access, insert, and delete.
- **Student outcome:** Implement core structures, test edge cases such as empty operations, and select structures based on complexity and use case.
- **Book activity direction:** Code and exercise the structures rather than only classify them.
- **Current tracker alignment:** No direct lesson; `ratelimiting9` occupies tracker position 35.

#### 36. Data Visualization Techniques

- **Pages:** Printed 134–136; PDF 145–147
- **Category:** Data and Information
- **Core content:** Visualization as pattern communication, bar charts for categories, line charts for trends, pie charts for proportions, scatter plots for correlation, histograms for distributions, labels/scales, and Python Matplotlib.
- **Student outcome:** Choose a chart based on the analytical question, construct it accurately, and explain the pattern without misleading the viewer.
- **Book activity direction:** Collect class data, represent it with several chart types, and compare what each reveals.
- **Current lab:** `datavisualization36` — direct alignment.

### Lessons 37–40: Mobile platforms, processor security, projects, and gestures

#### 37. Sundar Pichai

- **Pages:** Printed 137–139; PDF 148–150
- **Category:** Inventors and Innovators
- **Core content:** Android as an open and adaptable mobile platform, manufacturer customization, global affordability, hardware diversity, language/market support, platform openness versus control, ecosystem innovation, compatibility, security, and access.
- **Student outcome:** Compare open and closed platform strategies and make justified decisions about reach, quality, control, and innovation.
- **Book activity direction:** Design a platform strategy and simulate market/user outcomes.
- **Current lab:** `mobileplatform37` — direct alignment.

#### 38. The Spectre and Meltdown Vulnerabilities

- **Pages:** Printed 140–143; PDF 151–154
- **Category:** Case Studies
- **Core content:** Speculative execution, branch prediction, CPU caches, side-channel timing, privilege boundaries, Meltdown versus Spectre, cross-vendor exposure, software mitigations, processor redesign, and performance/security trade-offs.
- **Student outcome:** Trace how speculative work leaves observable cache evidence and compare mitigations by security and performance impact.
- **Book activity direction:** Model speculative execution/timing leakage and propose hardware/software defenses.
- **Current lab:** `spectremeltdown9` — direct alignment.

#### 39. Computing Project

- **Pages:** Printed 144–145; PDF 155–156
- **Category:** Activity / Project
- **Core content:** A four-week project worth 10%. Choices include Python data analysis with at least 20 records and statistics/charting; a sourced network-security case study; a four-table relational database with queries/reports; a 600–800 word digital-citizenship research paper; or a responsive two-to-three-page HTML/CSS/JavaScript application.
- **Student outcome:** Plan, build, test, document, cite evidence, and present one substantial computing artifact.
- **Book activity direction:** Student choice among five project pathways with real evidence and testing.
- **Current lab:** `computingproject39` should support project selection/planning and produce a usable brief, not falsely mark the four-week project itself complete.

#### 40. The Gesture Control Device

- **Pages:** Printed 146–148; PDF 157–159
- **Category:** Modern Gadgets
- **Core content:** Motion sensing, computer vision, infrared tracking, gesture recognition, 3D coordinates, machine-learning classification, contactless control, gaming, sign language, medical environments, accessibility, personalization, false detections, and interface design.
- **Student outcome:** Design and test a gesture vocabulary, interpret noisy sensor input, and improve accessibility without creating ambiguous controls.
- **Book activity direction:** Create a gesture language for a smart home and investigate assistive uses.
- **Current lab:** `gesturecontrol40` — direct alignment.

### Lessons 41–44: Computing history, logic, testing, and social benefit

#### 41. Historical Innovations

- **Pages:** Printed 149–153; PDF 160–164
- **Category:** Computer Languages / History
- **Core content:** Ada Lovelace and early algorithms; Alan Turing and computability; Grace Hopper and compilers; John Backus and FORTRAN; additional milestones in programming languages, networking, and open source; cumulative innovation and social context.
- **Student outcome:** Place key innovations in sequence, connect each to a modern concept, and explain how computing advances build on earlier work.
- **Book activity direction:** Research innovators, construct timelines, and connect historical inventions to current systems.
- **Current tracker alignment:** No direct lesson; `quantumcomputing9` occupies tracker position 41.

#### 42. Propositional Logic

- **Pages:** Printed 154–159; PDF 165–170
- **Category:** Math and Logic
- **Core content:** Propositions versus non-propositions, variables, negation, conjunction, disjunction, implication, biconditional, truth tables, precedence, tautologies, contradictions, equivalence, De Morgan's laws, and valid inference forms.
- **Student outcome:** Translate statements into symbols, construct truth tables, evaluate compound propositions, and apply logic to circuits/rules/puzzles.
- **Book activity direction:** Solve truth-table challenges and a treasure-box deduction puzzle.
- **Current lab:** `propositionallogic42` — direct alignment.

#### 43. Testing Strategies

- **Pages:** Printed 160–162; PDF 171–173
- **Category:** Software and Software Engineering
- **Core content:** Unit versus integration testing, Selenium browser automation, end-to-end workflows, test-driven development, behavior-driven development, continuous testing, the test pyramid, coverage, maintenance, reliability, manual versus automated testing, and edge cases.
- **Student outcome:** Select an appropriate test level, write expected outcomes, run repeatable tests, interpret failures, and design a balanced test strategy.
- **Book activity direction:** Build automated tests for a simple web application and compare them with manual testing.
- **Current tracker alignment:** No direct lesson; `bufferoverflow9` occupies tracker position 43.

#### 44. Computing Benefits

- **Pages:** Printed 163–165; PDF 174–176
- **Category:** Future of Computing
- **Core content:** Climate modelling, renewable-energy optimization, smart grids, computational fluid dynamics, graph optimization, precision agriculture, fintech, fraud detection, digital twins, remote education, telemedicine, digital inequality, energy use, hardware lifecycle, and sustainable computing.
- **Student outcome:** Evaluate a computing intervention using measurable environmental/economic benefits, costs, risks, and equity effects.
- **Book activity direction:** Produce and defend a cost-benefit analysis or design a local “computing for good” proposal.
- **Current lab:** `computingbenefits44` — direct alignment.

### Lessons 45–48: Semantic data, surgical robotics, security careers, and Log4j

#### 45. Ramanathan Guha

- **Pages:** Printed 166–168; PDF 177–179
- **Category:** Inventors and Innovators
- **Core content:** Semantic web limitations of raw text, RDF, subject-predicate-object triples, self-describing data, relationships, machine reasoning, inference, semantic search, recommendation, and integration across sources.
- **Student outcome:** Construct RDF-style triples, connect them into a graph, and demonstrate a search or inference enabled by explicit meaning.
- **Book activity direction:** Model classroom information semantically and compare semantic versus traditional organization.
- **Current lab:** `semanticweb45` — direct alignment.

#### 46. Robotics in Surgical Assistance

- **Pages:** Printed 169–171; PDF 180–182
- **Category:** Computing in Various Fields
- **Core content:** Robotic assistance rather than autonomous replacement, articulated instruments, enhanced 3D vision, tremor filtering, minimally invasive surgery, remote-operation possibilities, latency, training, cost, safety, access, and patient outcomes.
- **Student outcome:** Control a precision task, distinguish surgeon and robot responsibilities, and evaluate benefit/risk/access trade-offs.
- **Book activity direction:** Compare traditional and robotic procedures and propose a next-generation surgical system.
- **Current lab:** `roboticsurgery46` — direct alignment.

#### 47. Meet the Ethical Hacker!

- **Pages:** Printed 172–173; PDF 183–184
- **Category:** Jobs in Computing
- **Core content:** Authorized penetration testing, vulnerability assessment, programming/network/cryptography foundations, legal scope, explicit permission, reporting, responsible disclosure, professional ethics, collaboration, and the difference between ethical and malicious behavior.
- **Student outcome:** Keep security testing within an authorized scope, document evidence safely, recommend remediation, and explain professional responsibility.
- **Book activity direction:** Write a reflection on permission, boundaries, and responsibilities in ethical hacking.
- **Current tracker alignment:** `crosssitescripting9` is a related vulnerability lab but does not alone cover the ethical-hacker career lesson.

#### 48. The Log4j Logging Exploit

- **Pages:** Printed 174–176; PDF 185–187
- **Category:** Case Studies
- **Core content:** Log4Shell/CVE-2021-44228, Log4j logging, JNDI lookup processing, remote code execution through attacker-controlled input, widespread dependency exposure, disclosure and patching, incomplete early fixes, incident response, volunteer-maintained critical software, software supply-chain risk, SBOMs, and dependency auditing.
- **Student outcome:** Trace untrusted input to dangerous lookup/execution, identify dependency risk, prioritize incident response, and design monitoring, patching, and disclosure steps.
- **Book activity direction:** Conduct a dependency risk assessment or role-play coordinated vulnerability disclosure and emergency response.
- **Current tracker alignment:** No direct lesson; `blockchain9` occupies tracker position 48.

## Current tracker alignment summary

The current 48-lab tracker is not a one-to-one implementation of the textbook's 48 numbered lessons.

- **Direct or strong alignment:** 2, 4–12, 14–16, 18–19, 22–25, 27–28, 30–32, 36–40, 42, 44–46.
- **Adjacent but incomplete alignment:** 13, 17, 26, 41, 47.
- **No direct textbook-topic alignment at the same tracker position:** 1, 3, 20, 21, 29, 33, 34, 35, 43, 48.

This does not automatically make the additional cybersecurity labs unsuitable. It means reviews must clearly distinguish:

1. textbook-aligned lesson labs;
2. enrichment/substitution labs; and
3. topics from the book that currently have no direct interactive lab.

## Standard evidence expected from a textbook-aligned lab

Every lab should expose enough evidence to answer all of these questions:

- What exact textbook concept did the learner manipulate?
- What decision did the learner make?
- What safe failure showed a misconception or consequence?
- What feedback explained why?
- What did the learner improve on the next attempt?
- What final artifact, score, system state, explanation, or report proves the outcome?
- What final assessment verifies understanding rather than mere completion?
- Does the lab work through tap, keyboard, and mobile at 390×844?
- Does reset restore the entire state?
- Does LMS completion fire once using the correct lab ID?

## Editorial and fact-check cautions

The PDF contains material that should not be copied blindly into production labs:

- Some extracted definitions appear misplaced. For example, a tree definition on the early data-structures page describes a virtual machine.
- The firewall lesson includes text apparently carried over from the virtual-memory lesson.
- The Ajay Bhatt quick quiz contains a question about deep learning that does not match the lesson.
- Some headings or code labels lose characters in PDF extraction (for example, HTML appears as “H L”). Always verify visually against the PDF.
- Historical quantities, present-day costs, product capabilities, market shares, security recommendations, AGI claims, medical claims, and incident statistics require authoritative fact-checking before publication.
- Security labs must use safe simulations and must not turn exploit descriptions into instructions for attacking real systems.
- Health and privacy scenarios must avoid claiming that consumer devices provide diagnoses or total anonymity.

## Final reference rule

The textbook defines **what students are expected to learn**. `AGENTS.md` defines **what a complete interactive lab must provide**. The implementation must satisfy both.
