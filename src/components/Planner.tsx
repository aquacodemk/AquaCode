
import React, { useState } from 'react';
import { Search, Plus, Trash2, Save, CheckCircle, Dumbbell, Droplets, Zap, Calendar as CalendarIcon, ChevronDown, ChevronUp, AlertCircle, Check } from 'lucide-react';
import { EXERCISE_CATALOG } from '../constants';
import { Exercise, RoutineItem } from '../types';

interface PlannerProps {
  currentRoutine: RoutineItem[];
  addToRoutine: (exercise: Exercise) => void;
  removeFromRoutine: (id: string) => void;
  saveRoutine: (name: string) => void;
  scheduleWorkout: (date: string, name: string) => void;
  completeWorkout: () => void;
  savedRoutines: any[];
}

const Planner: React.FC<PlannerProps> = ({ 
  currentRoutine, 
  addToRoutine, 
  removeFromRoutine, 
  saveRoutine, 
  scheduleWorkout,
  completeWorkout,
  savedRoutines
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'water' | 'dry' | 'special'>('all');
  const [routineName, setRoutineName] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredCategories = EXERCISE_CATALOG.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || item.category === filter;
      return matchesSearch && matchesFilter;
    })
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="grid lg:grid-cols-12 gap-6 p-4 md:p-6 animate-fade-in">
      {/* Left Column: Catalog */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 dark:text-white">
            <Search className="text-cyan-500" />
            Каталог на Вежби
          </h2>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Пребарај вежба (пр. Жабица, Скок...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-cyan-400 dark:text-white transition-all"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'all', label: 'Сите', icon: null },
                { id: 'water', label: 'Водени', icon: <Droplets size={14} /> },
                { id: 'dry', label: 'Суви', icon: <Dumbbell size={14} /> },
                { id: 'special', label: 'Специјални', icon: <Zap size={14} /> },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                    filter === f.id
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredCategories.map((category, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{category.title}</h3>
                <span className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full">
                  {category.items.length} вежби
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {category.items.map((exercise) => {
                  const isExpanded = expandedId === exercise.id;
                  return (
                    <div 
                      key={exercise.id} 
                      onClick={() => toggleExpand(exercise.id)}
                      className={`group p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border transition-all cursor-pointer hover:shadow-md
                        ${isExpanded ? 'border-cyan-400 dark:border-cyan-500 ring-1 ring-cyan-400 dark:ring-cyan-500 shadow-md' : 'border-transparent hover:border-cyan-200 dark:hover:border-cyan-600'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl bg-white dark:bg-gray-600 w-10 h-10 flex items-center justify-center rounded-full shadow-sm">
                            {exercise.icon}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 dark:text-white leading-tight">{exercise.name}</h4>
                            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">{exercise.goal}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToRoutine(exercise);
                          }}
                          className="p-2 bg-white dark:bg-gray-600 text-cyan-600 dark:text-cyan-400 rounded-full shadow-sm hover:scale-110 active:scale-95 transition-transform"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      
                      <div className="mt-2">
                        <p className={`text-sm text-gray-500 dark:text-gray-400 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                          {exercise.instruction}
                        </p>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4 animate-slide-up">
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                             <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-sm mb-1">
                                <Check size={16} />
                                <span>Правилна Форма / Совети</span>
                             </div>
                             <p className="text-xs text-green-800 dark:text-green-300">
                                {exercise.tips || "Фокусирајте се на правилно дишење и стабилност на телото."}
                             </p>
                          </div>
                          
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
                             <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm mb-1">
                                <AlertCircle size={16} />
                                <span>Чести Грешки</span>
                             </div>
                             <p className="text-xs text-red-800 dark:text-red-300">
                                {exercise.mistakes || "Внимавајте да не го губите балансот или да тонете."}
                             </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 flex justify-center">
                        {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Routine Builder */}
      <div className="lg:col-span-4 space-y-6">
        <div className="sticky top-24">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border-t-4 border-cyan-500">
            <div className="p-6 bg-gradient-to-r from-cyan-50 to-white dark:from-cyan-900/20 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
                  <Dumbbell className="text-cyan-500" />
                  Мој Тренинг
                </h3>
                <span className="bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {currentRoutine.length}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2 min-h-[200px] max-h-[50vh] overflow-y-auto">
              {currentRoutine.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-10">
                  <Plus size={48} className="mb-2 opacity-20" />
                  <p>Додади вежби од каталогот</p>
                </div>
              ) : (
                currentRoutine.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg animate-slide-up">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-white truncate">{item.name}</span>
                    </div>
                    <button
                      onClick={() => removeFromRoutine(item.addedAt)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
              <input
                type="text"
                placeholder="Име на тренинг (опционално)"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="w-full px-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 dark:text-white"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    saveRoutine(routineName);
                    setRoutineName('');
                  }}
                  disabled={currentRoutine.length === 0}
                  className="flex items-center justify-center gap-2 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} /> Зачувај
                </button>
                <button
                  onClick={completeWorkout}
                  disabled={currentRoutine.length === 0}
                  className="flex items-center justify-center gap-2 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle size={16} /> Заврши
                </button>
              </div>

              {/* Schedule Section */}
              <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon size={14} className="text-gray-500" />
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Закажи во календар</span>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="flex-grow px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-cyan-500 dark:text-white"
                  />
                  <button 
                    onClick={() => {
                      scheduleWorkout(scheduleDate, routineName);
                      setRoutineName('');
                    }}
                    disabled={currentRoutine.length === 0}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Закажи
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {savedRoutines.length > 0 && (
             <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h4 className="font-bold text-gray-800 dark:text-white mb-4">Шаблони ({savedRoutines.length})</h4>
                <div className="space-y-2">
                   {savedRoutines.slice(0, 3).map((r, i) => (
                      <div key={i} className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                         {r.name} <span className="text-xs opacity-50">• {new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Planner;
