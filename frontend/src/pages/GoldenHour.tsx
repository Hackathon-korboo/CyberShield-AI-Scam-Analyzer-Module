import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  PhoneCall, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  Smartphone, 
  CreditCard, 
  Key, 
  Globe, 
  MessageSquare
} from 'lucide-react';
import { generateGoldenHourPlan } from '../services/api';
import { GoldenHourPlan } from '../types';

const GoldenHour: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [scenario, setScenario] = useState<string>('scenario_d');
  const [timeElapsed, setTimeElapsed] = useState<string>('< 1 hour');
  const [moneyTransferred, setMoneyTransferred] = useState<boolean>(true);
  const [amount, setAmount] = useState<string>('15000');
  const [utr, setUtr] = useState<string>('');
  const [bankName, setBankName] = useState<string>('State Bank of India');
  const [credentialsEntered, setCredentialsEntered] = useState<boolean>(false);
  const [appInstalled, setAppInstalled] = useState<boolean>(false);
  const [installedApp, setInstalledApp] = useState<string>('');
  
  const [plan, setPlan] = useState<GoldenHourPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    const scenarioParam = searchParams.get('scenario');
    let targetScenario = 'scenario_d';
    let targetMoney = true;
    let targetCreds = false;

    if (scenarioParam === 'financial_fraud' || scenarioParam === 'scenario_d') {
      targetScenario = 'scenario_d';
      targetMoney = true;
    } else if (scenarioParam === 'phishing_credentials' || scenarioParam === 'scenario_c') {
      targetScenario = 'scenario_c';
      targetMoney = false;
      targetCreds = true;
    } else if (scenarioParam === 'suspicious_link' || scenarioParam === 'scenario_b') {
      targetScenario = 'scenario_b';
      targetMoney = false;
    }

    setScenario(targetScenario);
    setMoneyTransferred(targetMoney);
    setCredentialsEntered(targetCreds);

    if (scenarioParam) {
      // Auto-trigger plan generation if navigated with scenario parameter
      generatePlanWithParams(targetScenario, targetMoney, targetCreds);
    }
  }, [searchParams]);

  const generatePlanWithParams = async (scen: string, money: boolean, creds: boolean) => {
    try {
      setLoading(true);
      const res = await generateGoldenHourPlan({
        scenario_type: scen,
        time_elapsed: timeElapsed,
        money_transferred: money,
        amount_transferred: amount,
        transaction_id_or_utr: utr,
        bank_or_app_name: bankName,
        credentials_entered: creds,
        app_installed: appInstalled,
        installed_app_name: installedApp
      });
      setPlan(res);
      setCompletedSteps(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      const res = await generateGoldenHourPlan({
        scenario_type: scenario,
        time_elapsed: timeElapsed,
        money_transferred: moneyTransferred,
        amount_transferred: amount,
        transaction_id_or_utr: utr,
        bank_or_app_name: bankName,
        credentials_entered: credentialsEntered,
        app_installed: appInstalled,
        installed_app_name: installedApp
      });
      setPlan(res);
      setCompletedSteps(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepNumber)) next.delete(stepNumber);
      else next.add(stepNumber);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1c1a17] text-white p-6 rounded-xl border border-[#2b2823] shadow-md">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
            Core Innovation 2 • CyberTrust 360 Inspired
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#faf8f5] tracking-tight">
          Golden Hour Incident Response Center
        </h1>
        <p className="text-sm text-[#a8a29e] mt-1 max-w-3xl">
          Contextual victim-response workflow for the critical 1-to-3-hour window when police nodal officers have peak efficacy to place liens on beneficiary accounts. Verified Indian law enforcement infrastructure: National Helpline 1930 & cybercrime.gov.in.
        </p>
      </div>

      {/* Emergency Quick Action Strip */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-900">National Cyber Crime Helpline: Dial 1930</h3>
            <p className="text-xs text-red-700">Immediate citizen financial cyber fraud reporting (24x7 all India toll-free)</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <a
            href="tel:1930"
            className="flex-1 md:flex-none text-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            Call 1930 Now
          </a>
          <a
            href="https://cybercrime.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none text-center px-4 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <span>cybercrime.gov.in</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main Grid: Questionnaire + Tailored Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Questionnaire */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#1c1a17] flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Incident Diagnostics</span>
            </h2>

            {/* Scenario Selection */}
            <div>
              <label className="block text-xs font-bold text-[#1c1a17] mb-1.5 uppercase tracking-wider text-[11px]">
                1. What happened?
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  { id: 'scenario_d', label: 'Transferred money (UPI / Bank)', icon: CreditCard },
                  { id: 'scenario_c', label: 'Entered password or OTP', icon: Key },
                  { id: 'scenario_e', label: 'Installed APK or remote app', icon: Smartphone },
                  { id: 'scenario_b', label: 'Clicked suspicious link only', icon: Globe },
                  { id: 'scenario_a', label: 'Received suspicious message only', icon: MessageSquare },
                ].map(opt => {
                  const Icon = opt.icon;
                  const isSelected = scenario === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setScenario(opt.id);
                        if (opt.id === 'scenario_d') setMoneyTransferred(true);
                        if (opt.id === 'scenario_c') setCredentialsEntered(true);
                        if (opt.id === 'scenario_e') setAppInstalled(true);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium flex items-center space-x-2.5 transition-colors ${
                        isSelected 
                          ? 'bg-[#1c1a17] text-white border-[#1c1a17]' 
                          : 'bg-[#f5f2eb] text-[#1c1a17] border-[#e5e2dc] hover:bg-[#eae6de]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-xs font-bold text-[#1c1a17] mb-1.5 uppercase tracking-wider text-[11px]">
                2. When did it happen?
              </label>
              <select
                value={timeElapsed}
                onChange={(e) => setTimeElapsed(e.target.value)}
                className="w-full text-xs font-semibold text-[#1c1a17] bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#1c1a17]"
              >
                <option value="< 1 hour">&lt; 1 hour ago (Golden Hour Active 🚨)</option>
                <option value="1-3 hours">1 to 3 hours ago (Peak Nodal Efficacy)</option>
                <option value="3-24 hours">3 to 24 hours ago</option>
                <option value="> 24 hours">&gt; 24 hours ago</option>
              </select>
            </div>

            {/* Context Details */}
            {scenario === 'scenario_d' && (
              <div className="space-y-3 pt-2 border-t border-[#e5e2dc]">
                <div>
                  <label className="block text-xs font-semibold text-[#52504c] mb-1">Amount Debited (₹)</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full text-xs p-2 bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg text-[#1c1a17]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#52504c] mb-1">Your Bank / App Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. SBI, HDFC, PhonePe"
                    className="w-full text-xs p-2 bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg text-[#1c1a17]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#52504c] mb-1">12-Digit UTR or Txn ID (Optional)</label>
                  <input
                    type="text"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="e.g. 409182736451"
                    className="w-full text-xs p-2 bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg text-[#1c1a17]"
                  />
                </div>
              </div>
            )}

            {scenario === 'scenario_e' && (
              <div className="pt-2 border-t border-[#e5e2dc]">
                <label className="block text-xs font-semibold text-[#52504c] mb-1">Name of App Installed</label>
                <input
                  type="text"
                  value={installedApp}
                  onChange={(e) => setInstalledApp(e.target.value)}
                  placeholder="e.g. AnyDesk, QuickSupport, APK name"
                  className="w-full text-xs p-2 bg-[#f5f2eb] border border-[#e5e2dc] rounded-lg text-[#1c1a17]"
                />
              </div>
            )}

            <button
              onClick={handleGeneratePlan}
              disabled={loading}
              className="w-full py-2.5 bg-[#1c1a17] hover:bg-[#2b2823] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Generating Checklist...' : 'Generate Action Plan'}</span>
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Action Plan & Checklists */}
        <div className="lg:col-span-2 space-y-4">
          {plan ? (
            <div className="space-y-4">
              {/* Golden Hour Status Banner */}
              <div className={`p-4 rounded-xl border ${
                plan.golden_hour_active 
                  ? 'bg-amber-50 border-amber-300 text-amber-900' 
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`w-5 h-5 shrink-0 ${plan.golden_hour_active ? 'text-amber-600' : 'text-blue-600'} mt-0.5`} />
                  <div>
                    <h3 className="text-sm font-bold">{plan.scenario_title}</h3>
                    <p className="text-xs font-semibold mt-1">{plan.golden_hour_warning}</p>
                  </div>
                </div>
              </div>

              {/* Interactive Checklist */}
              <div className="bg-white p-5 rounded-xl border border-[#e5e2dc] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1c1a17]">Prioritized Emergency Checklist</h3>
                    <p className="text-xs text-[#52504c]">Mark each protective measure as you execute it</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#f5f2eb] text-[#1c1a17] border border-[#e5e2dc]">
                    {completedSteps.size} of {plan.immediate_checklist.length} Completed
                  </span>
                </div>

                <div className="space-y-3">
                  {plan.immediate_checklist.map((step) => {
                    const isDone = completedSteps.has(step.step_number);
                    return (
                      <div
                        key={step.step_number}
                        onClick={() => toggleStep(step.step_number)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isDone 
                            ? 'bg-emerald-50/60 border-emerald-300' 
                            : 'bg-[#faf8f5] border-[#e5e2dc] hover:border-[#1c1a17]'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => {}} // Handled by parent div
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1c1a17] focus:ring-[#1c1a17] cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-xs text-[#1c1a17]">
                                Step {step.step_number}: {step.title}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                step.urgency === 'IMMEDIATE' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {step.urgency}
                              </span>
                            </div>
                            <p className="text-xs text-[#52504c] mt-1 leading-relaxed">{step.description}</p>
                            
                            {step.verified_channel && (
                              <p className="text-[11px] text-[#78716c] mt-1.5 font-medium">
                                🔒 Verified Channel: <span className="text-[#1c1a17]">{step.verified_channel}</span>
                              </p>
                            )}

                            {step.evidence_tips && (
                              <p className="text-[11px] text-amber-800 mt-1 italic">
                                📌 Tip: {step.evidence_tips}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Evidence Preservation Guide */}
              {plan.evidence_preservation_guide.length > 0 && (
                <div className="bg-[#f5f2eb] p-5 rounded-xl border border-[#e5e2dc] shadow-sm">
                  <h4 className="text-xs font-bold text-[#1c1a17] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    <span>Evidence Preservation Guidelines (Do Not Delete!)</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#52504c]">
                    {plan.evidence_preservation_guide.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-3 bg-[#f5f2eb] rounded-lg border border-[#e5e2dc] text-[11px] text-[#78716c] leading-relaxed">
                {plan.disclaimer}
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-xl border border-[#e5e2dc] text-center text-[#52504c] space-y-3">
              <ShieldCheck className="w-12 h-12 text-[#52504c] mx-auto opacity-40" />
              <h3 className="text-base font-bold text-[#1c1a17]">Ready to Guide Your Response</h3>
              <p className="text-xs max-w-md mx-auto">
                Select what happened in the incident diagnostics column on the left and click <strong>Generate Action Plan</strong> to receive your step-by-step containment checklist.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoldenHour;
