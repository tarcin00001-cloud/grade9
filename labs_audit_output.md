# Phase 3 Tier D Audit Results

## Clean fit (4)
| Slug | Current Type Name | Current Values | Notes |
|---|---|---|---|
| DeepLearning9.tsx | Phase | learn | training_fail | failed | feedback | improving | t... | Strong narrative flow mapping easily to canonical stages (Method A/B). |
| ITSupport18.tsx | Phase | intro | playing | feedback | game_over | success | Strong narrative flow mapping easily to canonical stages (Method A/B). |
| ResponsibleAI23.tsx | Phase | intro | playing | feedback | game_over | success | Strong narrative flow mapping easily to canonical stages (Method A/B). |
| VirtualMem9.tsx | Phase | intro | ram_fill | first_fault | thrashing_intro | thrash... | Strong narrative flow mapping easily to canonical stages (Method A/B). |

## Partial fit, documented gaps (2)
| Slug | Current Type Name | Current Values | Notes |
|---|---|---|---|
| BrainComputerInterface9.tsx | LabStage |  | INTRO"             // Step 1: Learn about skull attenu... | Maps sequentially but explicitly skips FAIL or UNDERSTAND. |
| PropositionalLogic42.tsx | MissionPhase | M1_SANDBOX | M2_AND | M3_OR | M4_XOR | M5_FAULT | OUTCOME | Maps sequentially but explicitly skips FAIL or UNDERSTAND. |

## Multi-stepper / combinator needed (2)
| Slug | Current Type Name | Current Values | Notes |
|---|---|---|---|
| BufferOverflow9.tsx | Stage | 1 | 2 | 3 | 4 | 5 | 6 | Multiple state variables (Stage + SysState) drive the narrative. |
| PasswordCracking9.tsx | Stage | 1 | 2 | 3 | 4 | Multiple state machines found: stage, status. Needs Method C design. |

## No honest fit (52)
| Slug | Current Type Name | Current Values | Notes |
|---|---|---|---|
| AGIInterview19.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| AdvancedAlgorithms24.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| AlgorithmicMusic9.tsx | GeneratorType | random | fibonacci | primes | random_walk | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| BinarySearch12.tsx | Phase | idle | pick_mid | evaluate | failed | success | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| Blockchain9.tsx | ChainState |  | trad_pristine | trad_hacked | trad_cashed_out | bc_pri... | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| ChaosEngineering9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| ClassesInJava9.tsx | ActivityId | blueprint | factory | actions | encapsulation | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| CloudStrategy16.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| Cloudflare9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| ComputingBenefits44.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| Containerization9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| ContentDeliveryNetwork9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| ContinuousIntegration9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| CrossSiteScripting9.tsx | PayloadType | BENIGN | SCRIPT | IMG | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| CsrfAttacks9.tsx | VaultStatus | IDLE | SUCCESS | COMPROMISED | BLOCKED | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| DatabaseIndexing9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| DigitalSignatures9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| EdgeComputing9.tsx | Phase | IDLE | SEND_CLOUD | CRASH | SEND_EDGE | STOP_SAFE | DONE | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| EventSourcing9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| FoldableSmartphone11.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| Gpu9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| GraphQLBasics9.tsx | Phase | IDLE | REQUESTING | PROCESSING | RETURNING | DONE | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| LoadBalancing9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| MachineLearning9.tsx | LearningRate | none | slow | optimal | fast | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| MachineLearningTraining9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| ManInTheMiddle9.tsx | Stage | 1 | 2 | 3 | 4 | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| Microservices9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| MobilePlatform37.tsx | Stage | 1 | 2 | 3 | 4 | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| OauthFlow9.tsx | Phase | APP_START | GOOGLE_CONSENT | GOOGLE_TOKEN | APP_RETURN | ... | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| OopPython15.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| PublicKeyInfrastructure9.tsx | Phase | IDLE | SEND_CSR | CA_STAMPS | CERT_ISSUED | CLIENT_CONNEC... | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| RateLimiting9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| RequirementAnalysis9.tsx | MissionId | ecommerce | streaming | superapp | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| ReverseProxies9.tsx | PacketType | DDOS | GOOD | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| RoboticSurgery46.tsx | ModalState | none | level1_fail | fail | level_complete | success | quiz | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| SemanticWeb45.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| ServerlessFunctions9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| SetsAndVenn27.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| SmartContracts9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| SmartRing32.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| SpectreMeltdown9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| SshKeys9.tsx | PacketType | PASSWORD | PLAYER_PUBKEY | ALICE_PUBKEY | PLAYER_HANDSHAK... | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| Subnetting9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| TestingStrategies43.tsx | QAState |  | manual_1_typing | manual_1_testing | manual_1_success ... | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| TorRouting9.tsx | Phase | IDLE | NODE1 | NODE2 | NODE3 | TARGET | DONE | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| TwoFactorAuth9.tsx | Phase | IDLE | SUCCESS | ERROR | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| USBConnectivity25.tsx | Era | LEGACY | USB | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| Univac9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| VectorDatabases9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| WebAssembly9.tsx | RunMode | IDLE | JS | COMPILING | WASM | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |
| WebSockets9.tsx | N/A |  | No narrative-driving state variable found. Likely a toggle/static tool. |
| ZeroDayExploit9.tsx | Phase | IDLE | ATTACK_FLYING | BREACHED | PATCHING | PATCHED | AT... | Actual flow isn't a learning-arc narrative; it's a simulation, request cycle, or single-screen tool. |

### Recommended Next-Batch Candidates
- `DeepLearning9.tsx`
- `ITSupport18.tsx`
- `ResponsibleAI23.tsx`
- `VirtualMem9.tsx`
- `BrainComputerInterface9.tsx`
- `PropositionalLogic42.tsx`
