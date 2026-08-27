"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLabAudio } from "@/hooks/useLabAudio";
import Celebration from "@/components/Celebration";
import LabShell from "@/components/LabShell";
import { 
  Network, Share2, BookOpen, User, Calendar, 
  Apple, Laptop, TreeDeciduous, Factory, Cookie,
  Code, Globe, Database, Lightbulb, 
  Users, Presentation, GraduationCap, Link,
  Stethoscope, Thermometer, Microchip, Activity, 
  CheckCircle2, AlertCircle, Play, ArrowRight
} from "lucide-react";

interface Triple {
  sub: string;
  pred: string;
  obj: string;
}

interface LevelData {
  id: number;
  title: string;
  desc: string;
  nodes: { id: string; label: string; icon: React.ReactNode }[];
  predicates: string[];
  targetTriples: Triple[];
}

const LEVELS: LevelData[] = [
  {
    id: 1,
    title: "Level 1: The Basics of RDF",
    desc: "Build basic Subject ➔ Predicate ➔ Object relationships (Triples).",
    nodes: [
      { id: "shakespeare", label: "William Shakespeare", icon: <User /> },
      { id: "hamlet", label: "Hamlet", icon: <BookOpen /> },
      { id: "1564", label: "Year 1564", icon: <Calendar /> }
    ],
    predicates: ["authored", "born_in", "hates"],
    targetTriples: [
      { sub: "shakespeare", pred: "authored", obj: "hamlet" },
      { sub: "shakespeare", pred: "born_in", obj: "1564" }
    ]
  },
  {
    id: 2,
    title: "Level 2: The Context Problem",
    desc: "Teach the AI the difference between ambiguous words using context.",
    nodes: [
      { id: "apple_inc", label: "Apple Inc.", icon: <Laptop /> },
      { id: "apple_fruit", label: "Apple (Fruit)", icon: <Apple /> },
      { id: "iphone", label: "iPhone", icon: <Microchip /> },
      { id: "tree", label: "Tree", icon: <TreeDeciduous /> },
      { id: "tech_co", label: "Tech Company", icon: <Factory /> },
      { id: "food", label: "Food", icon: <Cookie /> }
    ],
    predicates: ["is_a", "produces", "grows_on"],
    targetTriples: [
      { sub: "apple_inc", pred: "is_a", obj: "tech_co" },
      { sub: "apple_inc", pred: "produces", obj: "iphone" },
      { sub: "apple_fruit", pred: "is_a", obj: "food" },
      { sub: "apple_fruit", pred: "grows_on", obj: "tree" }
    ]
  },
  {
    id: 3,
    title: "Level 3: Ramanathan's Vision",
    desc: "Map out the creation of the Semantic Web.",
    nodes: [
      { id: "ramanathan", label: "Ramanathan Guha", icon: <Lightbulb /> },
      { id: "rdf", label: "RDF", icon: <Code /> },
      { id: "semantic_web", label: "Semantic Web", icon: <Globe /> },
      { id: "data", label: "Internet Data", icon: <Database /> }
    ],
    predicates: ["invented", "enables", "describes_itself_using"],
    targetTriples: [
      { sub: "ramanathan", pred: "invented", obj: "rdf" },
      { sub: "rdf", pred: "enables", obj: "semantic_web" },
      { sub: "data", pred: "describes_itself_using", obj: "rdf" }
    ]
  },
  {
    id: 4,
    title: "Level 4: Semantic Data Modelling",
    desc: "Map out classroom dependencies so an AI could query relationships.",
    nodes: [
      { id: "alice", label: "Student Alice", icon: <User /> },
      { id: "bob", label: "Student Bob", icon: <Users /> },
      { id: "mr_smith", label: "Mr. Smith", icon: <GraduationCap /> },
      { id: "project_x", label: "Project Alpha", icon: <Presentation /> }
    ],
    predicates: ["teaches", "works_on", "partners_with"],
    targetTriples: [
      { sub: "alice", pred: "works_on", obj: "project_x" },
      { sub: "bob", pred: "works_on", obj: "project_x" },
      { sub: "mr_smith", pred: "teaches", obj: "alice" },
      { sub: "alice", pred: "partners_with", obj: "bob" }
    ]
  },
  {
    id: 5,
    title: "Boss Level: AI Inference Engine",
    desc: "Build a complex medical knowledge graph.",
    nodes: [
      { id: "patient", label: "Patient X", icon: <User /> },
      { id: "fever", label: "Fever", icon: <Thermometer /> },
      { id: "covid", label: "COVID-19", icon: <Activity /> },
      { id: "virus", label: "Virus", icon: <Network /> }
    ],
    predicates: ["has_symptom", "is_symptom_of", "is_a", "infected_by"],
    targetTriples: [
      { sub: "patient", pred: "has_symptom", obj: "fever" },
      { sub: "fever", pred: "is_symptom_of", obj: "covid" },
      { sub: "covid", pred: "is_a", obj: "virus" },
      { sub: "patient", pred: "infected_by", obj: "covid" }
    ]
  }
];

export default function SemanticWeb45() {
  const { playClick, playPop, playSuccess, playError } = useLabAudio();
  
  const [currentLevel, setCurrentLevel] = useState(0);
  const [win, setWin] = useState(false);
  
  const levelData = LEVELS[currentLevel];
  
  // Builder State
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedPred, setSelectedPred] = useState<string | null>(null);
  const [selectedObj, setSelectedObj] = useState<string | null>(null);
  
  // Progress State
  const [learnedTriples, setLearnedTriples] = useState<Triple[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const levelPassed = learnedTriples.length === levelData.targetTriples.length;

  const handleNodeClick = (nodeId: string) => {
    if (playClick) playClick();
    setErrorMsg(null);
    if (!selectedSub) {
      setSelectedSub(nodeId);
    } else if (selectedSub && selectedPred && !selectedObj) {
      if (nodeId === selectedSub) {
        if (playError) playError();
        setErrorMsg("Subject and Object cannot be the same!");
        return;
      }
      setSelectedObj(nodeId);
    } else if (selectedSub && !selectedPred) {
      if (playError) playError();
      setErrorMsg("Select a Predicate (relationship) first!");
    } else {
      // Reset if clicking around when full
      setSelectedSub(nodeId);
      setSelectedPred(null);
      setSelectedObj(null);
    }
  };

  const handlePredClick = (pred: string) => {
    if (playClick) playClick();
    setErrorMsg(null);
    if (!selectedSub) {
      if (playError) playError();
      setErrorMsg("Select a Subject node first!");
      return;
    }
    setSelectedPred(pred);
    setSelectedObj(null); // Reset object if changing pred
  };

  const handleConnect = () => {
    if (!selectedSub || !selectedPred || !selectedObj) return;

    // Check if valid target
    const isValid = levelData.targetTriples.some(
      t => t.sub === selectedSub && t.pred === selectedPred && t.obj === selectedObj
    );

    const alreadyLearned = learnedTriples.some(
      t => t.sub === selectedSub && t.pred === selectedPred && t.obj === selectedObj
    );

    if (alreadyLearned) {
      if (playError) playError();
      setErrorMsg("AI already knows this fact!");
      setSelectedSub(null);
      setSelectedPred(null);
      setSelectedObj(null);
      return;
    }

    if (isValid) {
      if (playSuccess) playSuccess();
      setLearnedTriples([...learnedTriples, { sub: selectedSub, pred: selectedPred, obj: selectedObj }]);
      setSelectedSub(null);
      setSelectedPred(null);
      setSelectedObj(null);
      setErrorMsg(null);
    } else {
      if (playError) playError();
      setErrorMsg("Invalid relationship. That doesn't make sense!");
      setSelectedSub(null);
      setSelectedPred(null);
      setSelectedObj(null);
    }
  };

  const nextLevel = () => {
    if (currentLevel === LEVELS.length - 1) {
      setWin(true);
      if (playSuccess) playSuccess();
    } else {
      if (playPop) playPop();
      setCurrentLevel(currentLevel + 1);
      setLearnedTriples([]);
      setSelectedSub(null);
      setSelectedPred(null);
      setSelectedObj(null);
      setErrorMsg(null);
    }
  };

  const getNodeLabel = (id: string) => levelData.nodes.find(n => n.id === id)?.label || id;
  const getNodeIcon = (id: string) => levelData.nodes.find(n => n.id === id)?.icon;

  const handleReset = () => {
    if (playPop) playPop();
    setCurrentLevel(0);
    setLearnedTriples([]);
    setSelectedSub(null);
    setSelectedPred(null);
    setSelectedObj(null);
    setErrorMsg(null);
    setWin(false);
  };

  if (win) {
    return (
      <LabShell labId="semanticweb45" title="The Semantic Web" onReset={handleReset}>
        <Celebration isActive={win} />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.5)]">
            <Share2 className="text-white w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Semantic Data Architect!
          </h2>
          <p className="text-slate-300 text-lg max-w-lg">
            You've successfully taught the AI to understand relationships, context, and meaning. You are building the foundation of intelligent, self-describing data!
          </p>
          <button
            onClick={() => {
              setCurrentLevel(0);
              setLearnedTriples([]);
              setWin(false);
            }}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors mt-8"
          >
            Play Again
          </button>
        </motion.div>
      </LabShell>
    );
  }

  return (
    <LabShell 
      labId="semanticweb45" 
      title="The Semantic Web"
      onReset={handleReset}
      instruction="1. Understand the concepts of the Semantic Web and Resource Description Framework (RDF). 2. Use the interactive builder to construct a knowledge graph from provided data. 3. Link related entities and define their properties to create semantic meaning. 4. Run queries against the knowledge graph to extract complex relationships."
    >
      <div className="max-w-6xl mx-auto space-y-2">
        
        {/* Header */}
        <div className="bg-white border border-slate-300 rounded-xl p-2 flex flex-col md:flex-row gap-2 items-center justify-between shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
              <Share2 size={24} />
              {levelData.title}
            </h2>
            <p className="text-slate-600 text-sm mt-1">{levelData.desc}</p>
          </div>
          <div className="flex gap-2">
            {LEVELS.map((lvl, idx) => (
              <div
                key={lvl.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  idx < currentLevel
                    ? 'bg-red-600 border-red-500 text-white'
                    : idx === currentLevel
                    ? 'border-red-500 text-red-600 bg-red-50 shadow-sm'
                    : 'border-slate-300 text-slate-500 bg-white'
                }`}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[65vh] min-h-[420px] max-h-[550px]">
          
          {/* Left Panel: Available Nodes */}
          <div className="bg-white border border-slate-300 rounded-xl p-3 shadow-sm flex flex-col col-span-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Database size={18} className="text-red-600" />
              Raw Data Nodes
            </h3>
            
            <div className="flex-1 min-h-0 grid grid-cols-2 gap-2 content-start pr-1">
              {levelData.nodes.map(node => {
                const isSelectedSub = selectedSub === node.id;
                const isSelectedObj = selectedObj === node.id;
                return (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node.id)}
                    className={`p-1 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all ${
                      isSelectedSub ? 'bg-indigo-50 border-indigo-500 shadow-sm transform scale-105' :
                      isSelectedObj ? 'bg-emerald-50 border-emerald-500 shadow-sm transform scale-105' :
                      'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className={isSelectedSub ? 'text-indigo-600 scale-75' : isSelectedObj ? 'text-emerald-600 scale-75' : 'text-slate-500 scale-75'}>
                      {node.icon}
                    </div>
                    <span className={`text-[10px] leading-tight font-semibold ${isSelectedSub || isSelectedObj ? 'text-slate-800' : 'text-slate-600'}`}>
                      {node.label}
                    </span>
                  </button>
                )
              })}
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-200 text-xs text-slate-500">
              Click a node to set it as a Subject or Object.
            </div>
          </div>

          {/* Middle Panel: The Triple Builder */}
          <div className="bg-white border border-slate-300 rounded-xl p-3 shadow-sm flex flex-col col-span-1 lg:col-span-1 items-center justify-center relative">
            <h3 className="absolute top-3 left-3 text-lg font-bold text-slate-800 flex items-center gap-2">
              <Code size={18} className="text-purple-600" />
              Triple Builder
            </h3>

            {errorMsg && (
              <div className="absolute top-14 text-rose-400 text-sm font-bold bg-rose-950/40 px-4 py-1 rounded-full border border-rose-900/50 text-center">
                {errorMsg}
              </div>
            )}

            <div className="w-full flex flex-col items-center gap-2 mt-8">
              
              {/* Subject Slot */}
              <div className={`w-full max-w-[160px] h-12 rounded-xl border-2 flex items-center justify-center p-1 text-center transition-all ${
                selectedSub ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 border-dashed bg-slate-50'
              }`}>
                {selectedSub ? (
                  <div className="flex flex-col items-center text-indigo-600">
                    {getNodeIcon(selectedSub)}
                    <span className="text-sm font-bold mt-1 text-slate-800">{getNodeLabel(selectedSub)}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 font-semibold text-sm">1. Select Subject Node</span>
                )}
              </div>

              <div className="w-1 h-3 bg-slate-300" />

              {/* Predicate Selection */}
              <div className="w-full">
                <div className="flex flex-wrap justify-center gap-2">
                  {levelData.predicates.map(pred => (
                    <button
                      key={pred}
                      onClick={() => handlePredClick(pred)}
                      className={`px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${
                        selectedPred === pred 
                          ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' 
                          : 'bg-slate-100 border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {pred.replace(/_/g, " ").toUpperCase()}
                    </button>
                  ))}
                </div>
                {!selectedPred && <div className="text-center text-slate-500 text-xs mt-2 font-semibold">2. Select Predicate</div>}
              </div>

              <div className="w-1 h-3 bg-slate-300 relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-300 translate-y-full" />
              </div>

              {/* Object Slot */}
              <div className={`w-full max-w-[160px] h-12 rounded-xl border-2 flex items-center justify-center p-1 text-center transition-all mt-1 ${
                selectedObj ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 border-dashed bg-slate-50'
              }`}>
                {selectedObj ? (
                  <div className="flex flex-col items-center text-emerald-600">
                    {getNodeIcon(selectedObj)}
                    <span className="text-sm font-bold mt-1 text-slate-800">{getNodeLabel(selectedObj)}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 font-semibold text-sm">3. Select Object Node</span>
                )}
              </div>

            </div>

            <button
              onClick={handleConnect}
              disabled={!selectedSub || !selectedPred || !selectedObj}
              className={`mt-3 px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                selectedSub && selectedPred && selectedObj
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_20px_rgba(79,70,229,0.4)] hover:-translate-y-1'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-300'
              }`}
            >
              <Link size={20} /> Create Connection
            </button>
          </div>

          {/* Right Panel: Knowledge Graph */}
          <div className="bg-white border border-slate-300 rounded-xl p-3 shadow-sm flex flex-col col-span-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Network size={18} className="text-emerald-600" />
              AI Knowledge Graph
            </h3>
            
            <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-sm mb-4">
              <span className="text-slate-600 font-semibold">Connections Learned:</span>
              <span className="text-emerald-600 font-mono font-bold text-lg">
                {learnedTriples.length} / {levelData.targetTriples.length}
              </span>
            </div>

            <div className="flex-1 min-h-0 space-y-2 overflow-y-auto pr-2">
              <AnimatePresence>
                {learnedTriples.map((t, idx) => (
                  <motion.div
                    key={`${t.sub}-${t.pred}-${t.obj}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-2 bg-white border border-slate-200 shadow-sm rounded-xl flex items-center justify-between gap-1"
                  >
                    <div className="flex flex-col items-center justify-center flex-1 min-w-0 text-indigo-600">
                      <div className="scale-75">{getNodeIcon(t.sub)}</div>
                      <span className="text-[10px] font-bold text-center leading-tight truncate w-full text-slate-700">{getNodeLabel(t.sub)}</span>
                    </div>
                    
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-[8px] uppercase font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full border border-purple-200 whitespace-nowrap">
                        {t.pred.replace(/_/g, " ")}
                      </span>
                      <ArrowRight size={10} className="text-slate-400 mt-0.5" />
                    </div>

                    <div className="flex flex-col items-center justify-center flex-1 min-w-0 text-emerald-600">
                      <div className="scale-75">{getNodeIcon(t.obj)}</div>
                      <span className="text-[10px] font-bold text-center leading-tight truncate w-full text-slate-700">{getNodeLabel(t.obj)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {levelPassed && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl flex flex-col items-center justify-center gap-2 shrink-0"
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                    <CheckCircle2 size={24} />
                    Graph Complete!
                  </div>
                  <button 
                    onClick={nextLevel}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Next Level <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </LabShell>
  );
}
