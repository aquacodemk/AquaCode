
import React, { useState } from 'react';
import { WEEKLY_PLAN_DATA, MONTHLY_PLAN_DATA } from '../constants';
import { CheckCircle2, Info, Activity, Dumbbell, Waves, BatteryCharging, CalendarDays, Calendar, ChevronRight } from 'lucide-react';

const ProPlan: React.FC = () => {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [activeMonthWeek, setActiveMonthWeek] = useState(0);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in">
      <div className="bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            🏆 Професионален План
          </h2>
          <p className="text-indigo-200 text-lg md:text-xl font-light leading-relaxed">
            Микро и макро циклуси дизајнирани од Владо Смилевски за максимална експлозивност и издржливост.
          </p>
          
          <div className="flex gap-4 mt-8">
            <button 
              onClick={() => setView('weekly')}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                view === 'weekly' 
                ? 'bg-white text-purple-900 shadow-lg scale-105' 
                : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Calendar size={20} /> Неделен
            </button>
            <button 
              onClick={() => setView('monthly')}
              className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                view === 'monthly' 
                ? 'bg-white text-purple-900 shadow-lg scale-105' 
                : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <CalendarDays size={20} /> Месечен
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
          <Activity size={400} />
        </div>
        <div className="absolute -left-10 top-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {view === 'weekly' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {Object.entries(WEEKLY_PLAN_DATA).map(([day, data], idx) => {
            const isRest = data.type === 'rest';
            const isWater = data.type === 'water';
            const isDry = data.type === 'dry';
            
            let borderColor = 'border-gray-200 dark:border-gray-700';
            let bgColor = 'bg-white dark:bg-gray-800';
            let badgeClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            
            if (isRest) {
              borderColor = 'border-t-4 border-t-gray-400 border-gray-200 dark:border-gray-700';
            } else if (isWater) {
              borderColor = 'border-t-4 border-t-cyan-500 border-gray-200 dark:border-gray-700';
              badgeClass = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
            } else if (isDry) {
              borderColor = 'border-t-4 border-t-orange-500 border-gray-200 dark:border-gray-700';
              badgeClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            }

            return (
              <div 
                key={day} 
                className={`rounded-2xl p-6 shadow-lg border ${borderColor} ${bgColor} transition-all hover:-translate-y-2 duration-300`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold truncate text-gray-800 dark:text-white">{day}</h3>
                  <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${badgeClass}`}>
                    {isRest ? 'Одмор' : isWater ? 'Вода' : 'Суво'}
                  </span>
                </div>

                <h4 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-3">{data.title}</h4>

                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  isRest ? 'bg-gray-100 dark:bg-gray-700/50' : 
                  isWater ? 'bg-cyan-50 dark:bg-cyan-900/20' : 
                  'bg-orange-50 dark:bg-orange-900/20'
                }`}>
                  <p className="text-gray-600 dark:text-gray-400 flex items-start gap-2">
                     <Info size={16} className={isRest ? 'text-gray-400' : isWater ? 'text-cyan-400' : 'text-orange-400'} />
                     <span className="font-semibold">Цел: {data.goal}</span>
                  </p>
                </div>

                <ul className="space-y-3">
                  {data.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="mt-0.5">
                          {isRest ? <CheckCircle2 size={14} className="text-gray-400" /> : <CheckCircle2 size={14} className="text-green-500" />}
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-8 animate-slide-up">
           {/* Week Selector Tabs */}
           <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
              {MONTHLY_PLAN_DATA.map((week, idx) => (
                 <button
                    key={idx}
                    onClick={() => setActiveMonthWeek(idx)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all text-sm md:text-base ${
                       activeMonthWeek === idx
                       ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-300 dark:ring-purple-900 scale-105'
                       : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                 >
                    Недела {week.week}
                 </button>
              ))}
           </div>

           {/* Selected Week Summary Card */}
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-l-8 border-purple-500 overflow-hidden">
               <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                     <div>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                           Фокус на неделата
                        </span>
                        <h3 className="text-3xl font-black text-gray-800 dark:text-white mt-1">
                           {MONTHLY_PLAN_DATA[activeMonthWeek].phase}
                        </h3>
                     </div>
                     <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-700 dark:text-purple-300 font-bold text-sm">
                        Интензитет: {MONTHLY_PLAN_DATA[activeMonthWeek].intensity}
                     </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                     {MONTHLY_PLAN_DATA[activeMonthWeek].goal}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                     {MONTHLY_PLAN_DATA[activeMonthWeek].focus.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                           <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                           <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item}</span>
                        </div>
                     ))}
                  </div>
               </div>
           </div>

           {/* Detailed Daily Schedule for Selected Week */}
           <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <CalendarDays className="text-purple-500" />
              Распоред за Недела {MONTHLY_PLAN_DATA[activeMonthWeek].week}
           </h3>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(MONTHLY_PLAN_DATA[activeMonthWeek].schedule).map(([day, data], idx) => {
                 const isRest = data.type === 'rest';
                 const isWater = data.type === 'water';
                 const isDry = data.type === 'dry';
                 
                 let borderColor = 'border-gray-200 dark:border-gray-700';
                 let badgeClass = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
                 
                 if (isRest) {
                    borderColor = 'border-t-4 border-t-gray-400';
                 } else if (isWater) {
                    borderColor = 'border-t-4 border-t-cyan-500';
                    badgeClass = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
                 } else if (isDry) {
                    borderColor = 'border-t-4 border-t-orange-500';
                    badgeClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
                 }

                 return (
                    <div 
                       key={day} 
                       className={`rounded-2xl p-6 shadow-lg border ${borderColor} bg-white dark:bg-gray-800 transition-all hover:-translate-y-1`}
                       style={{ animationDelay: `${idx * 50}ms` }}
                    >
                       <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-gray-800 dark:text-white">{day}</h4>
                          <span className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${badgeClass}`}>
                             {isRest ? 'Одмор' : isWater ? 'Вода' : 'Суво'}
                          </span>
                       </div>
                       
                       <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                          {data.title}
                       </div>
                       
                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 italic">
                          Цел: {data.goal}
                       </p>

                       <ul className="space-y-2">
                          {data.items.map((item: string, i: number) => (
                             <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <ChevronRight size={14} className="mt-1 text-gray-400 flex-shrink-0" />
                                <span>{item}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                 );
              })}
           </div>
        </div>
      )}
    </div>
  );
};

export default ProPlan;
