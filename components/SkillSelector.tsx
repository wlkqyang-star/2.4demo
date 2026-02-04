import React, { useMemo } from 'react';
import { Skill } from '../types';
import { SKILLS } from '../constants';

interface SkillSelectorProps {
  onSelect: (skill: Skill) => void;
  level: number;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({ onSelect, level }) => {
  // Pick 3 random skills
  const availableSkills = useMemo(() => {
    const shuffled = [...SKILLS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [level]);

  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
      <h2 className="text-4xl font-bold text-white mb-2">Level {level} Start</h2>
      <p className="text-xl text-yellow-300 mb-8">Choose a buff for this run!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {availableSkills.map((skill) => (
          <button
            key={skill.id}
            onClick={() => onSelect(skill)}
            className="group relative bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-yellow-400 rounded-xl p-6 transition-all duration-200 transform hover:-translate-y-2 shadow-xl"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-200">
              {skill.icon}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{skill.name}</h3>
            <p className="text-slate-300">{skill.description}</p>
            <div className="absolute inset-0 border-2 border-yellow-400 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-200 pointer-events-none shadow-[0_0_20px_rgba(250,204,21,0.3)]"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SkillSelector;