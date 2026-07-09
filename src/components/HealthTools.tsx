import { useState } from "react";
import { Activity, Droplet, Flame, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

export default function HealthTools() {
  const [activeTab, setActiveTab] = useState<"bmi" | "water" | "calorie" | "risk">("bmi");

  // BMI state
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState("");

  const calculateBMI = () => {
    const hMeter = height / 100;
    const bmi = Number((weight / (hMeter * hMeter)).toFixed(1));
    setBmiResult(bmi);
    if (bmi < 18.5) setBmiCategory("Underweight");
    else if (bmi < 24.9) setBmiCategory("Normal weight");
    else if (bmi < 29.9) setBmiCategory("Overweight");
    else setBmiCategory("Obese");
  };

  // Water state
  const [waterWeight, setWaterWeight] = useState(70);
  const [activityMinutes, setActivityMinutes] = useState(30);
  const [waterResult, setWaterResult] = useState<number | null>(null);

  const calculateWater = () => {
    // Basic formula: weight (kg) * 35 ml + 350ml per 30 mins of exercise
    const baseWater = waterWeight * 35;
    const exerciseWater = (activityMinutes / 30) * 350;
    const totalLiters = Number(((baseWater + exerciseWater) / 1000).toFixed(2));
    setWaterResult(totalLiters);
  };

  // Calorie state
  const [calAge, setCalAge] = useState(28);
  const [calGender, setCalGender] = useState("male");
  const [calWeight, setCalWeight] = useState(72);
  const [calHeight, setCalHeight] = useState(178);
  const [calActivity, setCalActivity] = useState(1.375); // Lightly active
  const [calorieResult, setCalorieResult] = useState<number | null>(null);

  const calculateCalories = () => {
    // Mifflin-St Jeor Equation
    let bmr = 0;
    if (calGender === "male") {
      bmr = 10 * calWeight + 6.25 * calHeight - 5 * calAge + 5;
    } else {
      bmr = 10 * calWeight + 6.25 * calHeight - 5 * calAge - 161;
    }
    const tdee = Math.round(bmr * calActivity);
    setCalorieResult(tdee);
  };

  // Risk state
  const [riskAnswers, setRiskAnswers] = useState({
    smoking: "no",
    exercise: "yes",
    junkFood: "sometimes",
    familyHistory: "no",
    bpHistory: "no"
  });
  const [riskScore, setRiskScore] = useState<string | null>(null);
  const [riskFeedback, setRiskFeedback] = useState("");

  const assessRisk = () => {
    let score = 0;
    if (riskAnswers.smoking === "yes") score += 3;
    if (riskAnswers.exercise === "no") score += 2;
    if (riskAnswers.junkFood === "frequently") score += 2;
    if (riskAnswers.familyHistory === "yes") score += 2;
    if (riskAnswers.bpHistory === "yes") score += 1;

    if (score <= 2) {
      setRiskScore("Low Risk");
      setRiskFeedback("Excellent! Your daily lifestyle indicators show low susceptibility to chronic metabolic issues. Keep up your current routines.");
    } else if (score <= 5) {
      setRiskScore("Moderate Risk");
      setRiskFeedback("Your feedback indicates moderate risk. We strongly recommend adding 30 mins of daily aerobic yoga and curbing fast food consumption.");
    } else {
      setRiskScore("High Risk");
      setRiskFeedback("High lifestyle indicators found. We highly suggest scheduling a priority wellness consultation with our cardiologist and nutritionist.");
    }
  };

  return (
    <div id="health-tools" className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-800 shadow-xl shadow-slate-100 dark:shadow-none border border-green-100/20">
      <div className="mb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#2E7D32]">Calculator Suite</span>
        <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mt-1">Holistic Wellness Trackers</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-sans">Empower yourself with precise, instant clinical calculators to monitor your metabolic indicators.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-700 mb-6 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("bmi")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "bmi"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <Activity size={16} /> BMI Calculator
        </button>
        <button
          onClick={() => setActiveTab("water")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "water"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <Droplet size={16} /> Hydration Level
        </button>
        <button
          onClick={() => setActiveTab("calorie")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "calorie"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <Flame size={16} /> Calorie (TDEE)
        </button>
        <button
          onClick={() => setActiveTab("risk")}
          className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "risk"
              ? "border-[#2E7D32] text-[#2E7D32]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <ShieldAlert size={16} /> Health Risk Check
        </button>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[280px]">
        {activeTab === "bmi" && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Weight (kg)</label>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-[#2E7D32]"
                />
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                  <span>30 kg</span>
                  <span className="text-[#2E7D32] font-bold text-sm">{weight} kg</span>
                  <span>180 kg</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Height (cm)</label>
                <input
                  type="range"
                  min="100"
                  max="220"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-[#2E7D32]"
                />
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                  <span>100 cm</span>
                  <span className="text-[#2E7D32] font-bold text-sm">{height} cm</span>
                  <span>220 cm</span>
                </div>
              </div>

              <button
                onClick={calculateBMI}
                className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 rounded-xl font-medium transition-all shadow-md active:scale-95 duration-150 cursor-pointer"
              >
                Calculate BMI
              </button>
            </div>

            <div className="flex flex-col justify-center items-center bg-[#F8FAFC] dark:bg-slate-900 rounded-2xl p-6 border border-green-50/10 text-center">
              {bmiResult ? (
                <div className="space-y-3">
                  <span className="text-slate-400 uppercase text-xs font-bold tracking-widest">Your Body Mass Index</span>
                  <div className="text-5xl font-serif font-extrabold text-[#2E7D32]">{bmiResult}</div>
                  <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#2E7D32]/10 text-[#2E7D32]">
                    {bmiCategory}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 max-w-xs">
                    Normal BMI ranges between 18.5 and 24.9. Proper diet combined with Yoga Therapy can balance physical indicators.
                  </p>
                </div>
              ) : (
                <div className="text-slate-400 dark:text-slate-500 text-sm flex flex-col items-center gap-2">
                  <Activity size={48} className="stroke-1 text-[#2E7D32]/40" />
                  <span>Adjust sliders and click calculate.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "water" && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Weight (kg)</label>
                <input
                  type="range"
                  min="30"
                  max="150"
                  value={waterWeight}
                  onChange={(e) => setWaterWeight(Number(e.target.value))}
                  className="w-full accent-[#2E7D32]"
                />
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                  <span>30 kg</span>
                  <span className="text-[#2E7D32] font-bold text-sm">{waterWeight} kg</span>
                  <span>150 kg</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Daily Active Exercise (Minutes)</label>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="10"
                  value={activityMinutes}
                  onChange={(e) => setActivityMinutes(Number(e.target.value))}
                  className="w-full accent-[#2E7D32]"
                />
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                  <span>0 mins</span>
                  <span className="text-[#2E7D32] font-bold text-sm">{activityMinutes} mins</span>
                  <span>180 mins</span>
                </div>
              </div>

              <button
                onClick={calculateWater}
                className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 rounded-xl font-medium transition-all shadow-md active:scale-95 duration-150 cursor-pointer"
              >
                Calculate Water Target
              </button>
            </div>

            <div className="flex flex-col justify-center items-center bg-[#F8FAFC] dark:bg-slate-900 rounded-2xl p-6 border border-green-50/10 text-center">
              {waterResult ? (
                <div className="space-y-3">
                  <span className="text-slate-400 uppercase text-xs font-bold tracking-widest">Recommended Daily Water</span>
                  <div className="text-5xl font-serif font-extrabold text-[#2E7D32]">{waterResult} Liters</div>
                  <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#2E7D32]/10 text-[#2E7D32]">
                    ~ {Math.round(waterResult * 4)} standard glasses (250ml)
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 max-w-xs">
                    Proper hydration aids kidney filtration, cell oxygenation, and skin glow. Try tracking your daily intake!
                  </p>
                </div>
              ) : (
                <div className="text-slate-400 dark:text-slate-500 text-sm flex flex-col items-center gap-2">
                  <Droplet size={48} className="stroke-1 text-[#2E7D32]/40" />
                  <span>Calculate daily hydration requirements.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "calorie" && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Age</label>
                  <input
                    type="number"
                    value={calAge}
                    onChange={(e) => setCalAge(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#2E7D32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Gender</label>
                  <select
                    value={calGender}
                    onChange={(e) => setCalGender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#2E7D32] focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={calWeight}
                    onChange={(e) => setCalWeight(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#2E7D32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={calHeight}
                    onChange={(e) => setCalHeight(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#2E7D32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Physical Activity Level</label>
                <select
                  value={calActivity}
                  onChange={(e) => setCalActivity(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#2E7D32] focus:outline-none"
                >
                  <option value="1.2">Sedentary (Little/no exercise)</option>
                  <option value="1.375">Lightly Active (Exercise 1-3 days/week)</option>
                  <option value="1.55">Moderately Active (Exercise 3-5 days/week)</option>
                  <option value="1.725">Very Active (Heavy exercise daily)</option>
                </select>
              </div>

              <button
                onClick={calculateCalories}
                className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 rounded-xl font-medium transition-all shadow-md active:scale-95 duration-150 mt-2 cursor-pointer"
              >
                Calculate Calories
              </button>
            </div>

            <div className="flex flex-col justify-center items-center bg-[#F8FAFC] dark:bg-slate-900 rounded-2xl p-6 border border-green-50/10 text-center">
              {calorieResult ? (
                <div className="space-y-3">
                  <span className="text-slate-400 uppercase text-xs font-bold tracking-widest">Total Daily Energy Expenditure</span>
                  <div className="text-4xl font-serif font-extrabold text-[#2E7D32]">{calorieResult} Calories/day</div>
                  <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#2E7D32]/10 text-[#2E7D32]">
                    TDEE maintenance calorie target
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 max-w-xs">
                    To lose weight, target a deficit (e.g. {calorieResult - 400} kcal). Consult with our certified nutritionists.
                  </p>
                </div>
              ) : (
                <div className="text-slate-400 dark:text-slate-500 text-sm flex flex-col items-center gap-2">
                  <Flame size={48} className="stroke-1 text-[#2E7D32]/40" />
                  <span>Fill forms to identify your daily calorie limit.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "risk" && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Do you smoke cigarettes?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1"><input type="radio" name="smoking" checked={riskAnswers.smoking === "yes"} onChange={() => setRiskAnswers({ ...riskAnswers, smoking: "yes" })} className="accent-[#2E7D32]" /> Yes</label>
                  <label className="flex items-center gap-1"><input type="radio" name="smoking" checked={riskAnswers.smoking === "no"} onChange={() => setRiskAnswers({ ...riskAnswers, smoking: "no" })} className="accent-[#2E7D32]" /> No</label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">At least 150 mins exercise per week?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1"><input type="radio" name="exercise" checked={riskAnswers.exercise === "yes"} onChange={() => setRiskAnswers({ ...riskAnswers, exercise: "yes" })} className="accent-[#2E7D32]" /> Yes</label>
                  <label className="flex items-center gap-1"><input type="radio" name="exercise" checked={riskAnswers.exercise === "no"} onChange={() => setRiskAnswers({ ...riskAnswers, exercise: "no" })} className="accent-[#2E7D32]" /> No</label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fast-food or sugar beverage intake?</label>
                <select
                  value={riskAnswers.junkFood}
                  onChange={(e) => setRiskAnswers({ ...riskAnswers, junkFood: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-[#2E7D32] focus:outline-none"
                >
                  <option value="rarely">Rarely / Never</option>
                  <option value="sometimes">Sometimes (1-2 days/week)</option>
                  <option value="frequently">Frequently (3+ days/week)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Family history of early cardiovascular disease?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1"><input type="radio" name="familyHistory" checked={riskAnswers.familyHistory === "yes"} onChange={() => setRiskAnswers({ ...riskAnswers, familyHistory: "yes" })} className="accent-[#2E7D32]" /> Yes</label>
                  <label className="flex items-center gap-1"><input type="radio" name="familyHistory" checked={riskAnswers.familyHistory === "no"} onChange={() => setRiskAnswers({ ...riskAnswers, familyHistory: "no" })} className="accent-[#2E7D32]" /> No</label>
                </div>
              </div>

              <button
                onClick={assessRisk}
                className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 rounded-xl font-medium transition-all shadow-md active:scale-95 duration-150 mt-2 cursor-pointer"
              >
                Assess Lifestyle Risk
              </button>
            </div>

            <div className="flex flex-col justify-center items-center bg-[#F8FAFC] dark:bg-slate-900 rounded-2xl p-6 border border-green-50/10 text-center">
              {riskScore ? (
                <div className="space-y-3">
                  <span className="text-slate-400 uppercase text-xs font-bold tracking-widest">Cardio-Metabolic Risk Tier</span>
                  <div className={`text-4xl font-serif font-extrabold ${riskScore === "Low Risk" ? "text-green-600" : riskScore === "Moderate Risk" ? "text-amber-500" : "text-red-500"}`}>
                    {riskScore}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-xs mx-auto">
                    {riskFeedback}
                  </p>
                </div>
              ) : (
                <div className="text-slate-400 dark:text-slate-500 text-sm flex flex-col items-center gap-2">
                  <ShieldAlert size={48} className="stroke-1 text-red-400/40" />
                  <span>Start the 5-point wellness questionnaire.</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
