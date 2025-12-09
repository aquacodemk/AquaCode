
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Planner from './components/Planner';
import ProPlan from './components/ProPlan';
import Stats from './components/Stats';
import Gallery from './components/Gallery';
import { TabType, Exercise, RoutineItem, DailyStats, GalleryImage, ScheduledWorkout } from './types';
import { Moon, Sun, MapPin, Phone, Mail, Facebook, Instagram, Youtube, Twitter, Clock, Ruler, Thermometer, Users, Car, Navigation as NavIcon, ChevronLeft, ChevronRight, X, Play, Trash2, Quote, MessageSquarePlus, Github } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('planner');
  const [darkMode, setDarkMode] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState<RoutineItem[]>([]);
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [stats, setStats] = useState<DailyStats>({
    total: 0,
    streak: 0,
    lastDate: null,
    level: 'Почетник',
    calories: 0
  });
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [activityLog, setActivityLog] = useState<string[]>([]);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem('aqua-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Load Data
    const loadData = () => {
      try {
        const sr = JSON.parse(localStorage.getItem('aqua_routines') || '[]');
        setSavedRoutines(sr);

        const sched = JSON.parse(localStorage.getItem('aqua_scheduled') || '[]');
        setScheduledWorkouts(sched);
        
        const st = JSON.parse(localStorage.getItem('aqua_stats') || JSON.stringify(stats));
        setStats(st);

        const gal = JSON.parse(localStorage.getItem('aqua_gallery') || '[]');
        setGalleryImages(gal);

        const log = JSON.parse(localStorage.getItem('aqua_activity_log') || '[]');
        setActivityLog(log);
      } catch (e) {
        console.error("Error loading data", e);
      }
    };
    loadData();
  }, []);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('aqua_routines', JSON.stringify(savedRoutines));
  }, [savedRoutines]);

  useEffect(() => {
    localStorage.setItem('aqua_scheduled', JSON.stringify(scheduledWorkouts));
  }, [scheduledWorkouts]);

  useEffect(() => {
    localStorage.setItem('aqua_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('aqua_gallery', JSON.stringify(galleryImages));
  }, [galleryImages]);

  useEffect(() => {
    localStorage.setItem('aqua_activity_log', JSON.stringify(activityLog));
  }, [activityLog]);

  // Handlers
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aqua-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aqua-theme', 'light');
    }
  };

  const addToRoutine = (exercise: Exercise) => {
    setCurrentRoutine([...currentRoutine, { id: exercise.id, name: exercise.name, addedAt: new Date().toISOString() }]);
  };

  const removeFromRoutine = (addedAt: string) => {
    setCurrentRoutine(currentRoutine.filter(item => item.addedAt !== addedAt));
  };

  const saveRoutine = (name: string) => {
    const newRoutine = {
      id: Date.now(),
      name: name || `Тренинг ${new Date().toLocaleDateString()}`,
      exercises: currentRoutine,
      createdAt: new Date().toISOString(),
      completed: false
    };
    setSavedRoutines([newRoutine, ...savedRoutines]);
    setCurrentRoutine([]);
  };

  const scheduleWorkout = (date: string, name: string) => {
    const newScheduled: ScheduledWorkout = {
      id: Date.now(),
      name: name || `Планиран тренинг`,
      exercises: [...currentRoutine],
      createdAt: new Date().toISOString(),
      completed: false,
      date: date
    };
    setScheduledWorkouts([...scheduledWorkouts, newScheduled]);
    setCurrentRoutine([]);
    alert(`Тренингот е закажан за ${date}`);
  };

  const loadScheduledWorkout = (workout: ScheduledWorkout) => {
    setCurrentRoutine(workout.exercises);
    setSelectedDay(null);
    setActiveTab('planner');
  };

  const deleteScheduledWorkout = (id: number) => {
    if (window.confirm('Дали сте сигурни дека сакате да го избришете овој планиран тренинг?')) {
      setScheduledWorkouts(scheduledWorkouts.filter(w => w.id !== id));
    }
  };

  const completeWorkout = () => {
    const today = new Date().toDateString();
    const newStreak = stats.lastDate === new Date(Date.now() - 86400000).toDateString() 
      ? stats.streak + 1 
      : stats.lastDate === today ? stats.streak : 1;
    
    const newTotal = stats.total + 1;
    let newLevel = 'Почетник';
    if (newTotal > 10) newLevel = 'Напреден';
    if (newTotal > 50) newLevel = 'Професионалец';

    setStats({
      total: newTotal,
      streak: newStreak,
      lastDate: today,
      level: newLevel,
      calories: stats.calories + 450
    });

    setActivityLog([new Date().toISOString(), ...activityLog]);
    setCurrentRoutine([]);
    alert('Тренинг завршен! 💪');
  };

  const resetStats = () => {
    setStats({
      total: 0,
      streak: 0,
      lastDate: null,
      level: 'Почетник',
      calories: 0
    });
    setActivityLog([]);
    alert('Статистиката е успешно избришана.');
  };

  const addGalleryImage = (base64: string, name: string) => {
    const newImage: GalleryImage = {
      id: Date.now(),
      data: base64,
      name,
      timestamp: Date.now()
    };
    setGalleryImages([newImage, ...galleryImages]);
  };

  const removeGalleryImage = (id: number) => {
    setGalleryImages(galleryImages.filter(img => img.id !== id));
  };

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    // Adjust so Monday is 0 (standard for MK)
    let firstDay = getFirstDayOfMonth(year, month) - 1;
    if (firstDay === -1) firstDay = 6;

    const days = [];
    
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const hasCompleted = activityLog.some(log => log.split('T')[0] === dateString);
      const scheduledForDay = scheduledWorkouts.filter(w => w.date === dateString);
      const hasScheduled = scheduledForDay.length > 0;

      let bgClass = "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700";
      let textClass = "text-gray-700 dark:text-gray-300";
      
      if (hasCompleted) {
        bgClass = "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
        textClass = "text-green-800 dark:text-green-300 font-bold";
      } else if (hasScheduled) {
        bgClass = "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800";
        textClass = "text-cyan-800 dark:text-cyan-300 font-bold";
      }

      // Check for today
      const todayString = new Date().toISOString().split('T')[0];
      const isToday = dateString === todayString;

      days.push(
        <div 
          key={d} 
          onClick={() => setSelectedDay(dateString)}
          className={`aspect-square relative flex flex-col items-center justify-center rounded-xl border cursor-pointer transition-all ${bgClass} ${isToday ? 'ring-2 ring-cyan-500' : ''}`}
        >
          <span className={textClass}>{d}</span>
          <div className="flex gap-1 mt-1">
             {hasScheduled && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>}
             {hasCompleted && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
          </div>
        </div>
      );
    }
    return days;
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-20 flex flex-col">
      <header className="bg-gradient-to-br from-cyan-900 via-cyan-700 to-blue-800 text-white pt-8 pb-12 px-4 md:px-6 relative overflow-hidden">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         
         <div className="max-w-7xl mx-auto relative z-10">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 flex items-center">
                      <img 
                        src="AQUA Code logo.jpg" 
                        alt="AQUA Code" 
                        className="w-12 h-12 md:w-16 md:h-16 rounded-xl mr-3 shadow-lg border-2 border-white/10 object-cover" 
                      />
                      <span>AQUA CODE</span>
                   </h1>
                   <p className="text-cyan-100 font-bold tracking-wide text-xs md:text-sm uppercase opacity-90 leading-relaxed pl-1">
                      ВЕЖБАЈ • ИГРАЈ • ПОБЕДИ<br className="md:hidden" /> 
                      <span className="hidden md:inline"> • </span>
                      <span className="text-yellow-300">БЕЗ ОДМОР</span> • <span className="text-yellow-300">БЕЗ МИЛОСТ</span> • САМО ВАТЕРПОЛО
                   </p>
                </div>
                <button 
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all border border-white/20 flex-shrink-0 ml-4"
                >
                   {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
             </div>

             <div className="mt-6 md:mt-8">
                <p className="text-base md:text-lg text-cyan-50 font-light italic max-w-4xl border-l-4 border-cyan-400 pl-4 py-1">
                   "Нема комплицирана наука, туку практични вежби, лесни објаснувања и поддршка од заедница на луѓе кои, како тебе, сакаат само да уживаат во ватерполото и да напредуваат."
                   <span className="block text-xs md:text-sm font-bold text-white not-italic mt-2 opacity-90">— Владо Смилевски, Креатор на AQUA CODE</span>
                </p>
             </div>
         </div>
      </header>

      <div className="-mt-6 relative z-20">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <main className="mt-6 flex-grow">
        {activeTab === 'planner' && (
          <Planner 
            currentRoutine={currentRoutine}
            addToRoutine={addToRoutine}
            removeFromRoutine={removeFromRoutine}
            saveRoutine={saveRoutine}
            scheduleWorkout={scheduleWorkout}
            completeWorkout={completeWorkout}
            savedRoutines={savedRoutines}
          />
        )}
        {activeTab === 'pro-plan' && <ProPlan />}
        {activeTab === 'stats' && <Stats stats={stats} activityLog={activityLog} resetStats={resetStats} />}
        {activeTab === 'gallery' && (
          <Gallery 
            images={galleryImages}
            addImage={addGalleryImage}
            removeImage={removeGalleryImage}
          />
        )}
        {activeTab === 'calendar' && (
           <div className="max-w-4xl mx-auto p-4 md:p-6 animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold dark:text-white capitalize">
                        {currentDate.toLocaleDateString('mk-MK', { month: 'long', year: 'numeric' })}
                      </h2>
                      <div className="flex gap-2">
                          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-white">
                              <ChevronLeft size={24} />
                          </button>
                          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-white">
                              <ChevronRight size={24} />
                          </button>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-bold text-gray-500 dark:text-gray-400">
                      <div>Пон</div><div>Вто</div><div>Сре</div><div>Чет</div><div>Пет</div><div className="text-red-400">Саб</div><div className="text-red-400">Нед</div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                     {renderCalendar()}
                  </div>
                  
                  <div className="mt-6 flex gap-4 text-sm justify-center">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Закажан</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">Завршен</span>
                     </div>
                  </div>
              </div>

              {/* Day Details Modal */}
              {selectedDay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
                   <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
                      <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                         <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {new Date(selectedDay).toLocaleDateString('mk-MK', { dateStyle: 'full' })}
                         </h3>
                         <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                            <X size={24} />
                         </button>
                      </div>

                      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                         {/* Completed Activity */}
                         {activityLog.some(log => log.split('T')[0] === selectedDay) && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                               <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold mb-1">
                                  <Clock size={18} />
                                  <span>Тренинг завршен</span>
                               </div>
                               <p className="text-sm text-green-600 dark:text-green-300">Браво! Активноста е регистрирана.</p>
                            </div>
                         )}

                         {/* Scheduled Workouts */}
                         <h4 className="font-bold text-gray-700 dark:text-gray-300 mt-4">Планирани тренинзи:</h4>
                         {scheduledWorkouts.filter(w => w.date === selectedDay).length === 0 ? (
                            <p className="text-gray-400 text-center italic py-4">Нема закажани тренинзи за овој ден.</p>
                         ) : (
                            scheduledWorkouts.filter(w => w.date === selectedDay).map(workout => (
                               <div key={workout.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                                  <div className="flex justify-between items-start mb-3">
                                     <div>
                                        <h5 className="font-bold text-gray-800 dark:text-white">{workout.name}</h5>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">{workout.exercises.length} вежби</span>
                                     </div>
                                     <button 
                                        onClick={() => deleteScheduledWorkout(workout.id)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                     >
                                        <Trash2 size={16} />
                                     </button>
                                  </div>
                                  <button 
                                     onClick={() => loadScheduledWorkout(workout)}
                                     className="w-full flex items-center justify-center gap-2 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
                                  >
                                     <Play size={16} />
                                     Вчитај и Започни
                                  </button>
                               </div>
                            ))
                         )}
                      </div>
                   </div>
                </div>
              )}
           </div>
        )}
        {activeTab === 'contact' && (
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 animate-fade-in">
             <div className="grid lg:grid-cols-3 gap-8">
                {/* Contact Info */}
                <div className="lg:col-span-2 space-y-8">
                   <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Контакт Информации</h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                               <Mail className="text-cyan-600 dark:text-cyan-400" size={24} />
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-800 dark:text-white">Email</h4>
                               <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm break-all">aquacodemk@gmail.com</p>
                               <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Одговораме во рок од 24 часа</p>
                            </div>
                         </div>

                         <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                               <Phone className="text-cyan-600 dark:text-cyan-400" size={24} />
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-800 dark:text-white">Телефон</h4>
                               <p className="text-gray-600 dark:text-gray-400 mt-1">+389 70 123 456</p>
                               <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Пон-Пет: 08:00 - 20:00</p>
                            </div>
                         </div>

                         <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                               <MapPin className="text-cyan-600 dark:text-cyan-400" size={24} />
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-800 dark:text-white">Локација</h4>
                               <p className="text-gray-600 dark:text-gray-400 mt-1">Градски Базен, Куманово</p>
                               <p className="text-xs text-gray-500 dark:text-gray-500 mt-2"></p>
                            </div>
                         </div>

                         <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                               <Twitter className="text-cyan-600 dark:text-cyan-400" size={24} />
                            </div>
                            <div>
                               <h4 className="font-bold text-gray-800 dark:text-white">Социјални Мрежи</h4>
                               <div className="flex gap-3 mt-3">
                                  <button className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition">
                                     <Facebook size={16} />
                                  </button>
                                  <button className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition">
                                     <Instagram size={16} />
                                  </button>
                                  <button className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition">
                                     <Youtube size={16} />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Map/Address */}
                   <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Локација</h3>
                      <div className="bg-gray-100 dark:bg-gray-700 h-64 rounded-xl overflow-hidden mb-6">
                          <iframe 
                              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2960.218082179678!2d21.7143889!3d42.1321944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1354f7b5c41f7a0d%3A0x762c3d2b5a1b8e3c!2z0JPQtdGA0LTRg9C90YHRgtC4INCR0LDQt9C10L3RhtCw!5e0!3m2!1smk!2smk!4v1698765432100!5m2!1smk!2smk" 
                              width="100%" 
                              height="100%" 
                              style={{border:0}} 
                              allowFullScreen
                              loading="lazy" 
                              referrerPolicy="no-referrer-when-downgrade"
                              title="Градски Базен Куманово - Локација за ватерполо тренинг">
                          </iframe>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex items-start gap-3">
                                  <MapPin className="text-red-500 mt-1" size={20} />
                                  <div>
                                      <h4 className="font-bold text-gray-800 dark:text-white">Точна локација</h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                          Градски Базен "Куманово"<br/>
                                          Спортски центар за ватерполо
                                      </p>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex items-start gap-3">
                                  <NavIcon className="text-blue-500 mt-1" size={20} />
                                  <div>
                                      <h4 className="font-bold text-gray-800 dark:text-white">Навигација</h4>
                                      <div className="flex flex-col gap-2 mt-2">
                                          <a href="https://maps.app.goo.gl/UoXi2Do164Q8UdFf8" target="_blank" rel="noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Google Maps</a>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                      
                      {/* Pool Details */}
                      <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg mb-4">
                          <div className="flex items-start gap-3">
                              <div>
                                  <h4 className="font-bold text-gray-800 dark:text-white mb-2">Детали за базенот</h4>
                                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                      <div className="flex items-center gap-2">
                                          <Ruler className="text-gray-400" size={16} />
                                          <span className="text-sm text-gray-600 dark:text-gray-300">25m базен</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <Thermometer className="text-gray-400" size={16} />
                                          <span className="text-sm text-gray-600 dark:text-gray-300">26°C температура</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <Users className="text-gray-400" size={16} />
                                          <span className="text-sm text-gray-600 dark:text-gray-300">6 ленти</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <Clock className="text-gray-400" size={16} />
                                          <span className="text-sm text-gray-600 dark:text-gray-300">08:00-22:00</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                       {/* Instructions */}
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                          <div className="flex items-start gap-3">
                              <Car className="text-green-600 mt-1" size={20} />
                              <div>
                                  <h4 className="font-bold text-gray-800 dark:text-white">Како да стигнете</h4>
                                  <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                      <li>• Од градскиот плоштад: 5 минути пешки кон исток</li>
                                      <li>• Автобуси: Линија 4 до постојка "Базен"</li>
                                      <li>• Паркинг: Бесплатен пред базенот (20 места)</li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                   </div>
                </div>

                {/* Contact Form Link */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 h-fit sticky top-24">
                   <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Испрати мислење (Feedback)</h3>
                   <div className="space-y-4">
                      <div>
                         <label className="block text-sm font-medium mb-1 dark:text-gray-300">Вашето Име</label>
                         <input type="text" className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Внесете име" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email Адреса</label>
                         <input type="email" className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Внесете email" />
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">
                           * За детални прашања и повратни информации, ве молиме користете ја формата подолу.
                        </p>
                        <a 
                           href="https://docs.google.com/forms/d/e/1FAIpQLSc2YaZ3qqylwcSRw091Yw48eulnCrxvfvz1xOGC2TU9d3DpGA/viewform?usp=header"
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                        >
                            <MessageSquarePlus size={18} />
                            Испрати мислење (Feedback)
                        </a>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800 mt-auto">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="mb-8 max-w-2xl mx-auto">
               <Quote size={24} className="text-cyan-500 mb-4 mx-auto" />
               <p className="text-xl font-medium italic text-gray-300">
                  "Ватерполото не е само спорт, туку школа за живот. Те учи да бидеш силен, да соработуваш и никогаш да не се откажуваш."
               </p>
            </div>
            
            <div className="mb-8">
               <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSc2YaZ3qqylwcSRw091Yw48eulnCrxvfvz1xOGC2TU9d3DpGA/viewform?usp=header" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-cyan-700 text-white rounded-full transition-all border border-gray-700 hover:border-cyan-600"
               >
                  <MessageSquarePlus size={18} />
                  Испрати мислење (Feedback)
               </a>
            </div>

            <div className="pt-8 border-t border-gray-800">
               <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Развиено од Владо Смилевски</p>
               <div className="flex items-center justify-center gap-2 mt-3">
                 <a href="https://github.com/aquacodemk/AquaCode" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Github size={20} />
                 </a>
               </div>
               <p className="text-xs text-gray-600 mt-2">&copy; {new Date().getFullYear()} AQUA CODE. Сите права се задржани.</p>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;
