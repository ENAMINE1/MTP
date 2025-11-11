// CARL Visualization — fixed JSX structure and current-user details
// Note: This component assumes Tailwind CSS is configured and index.css is imported in main.jsx
import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';

const CARLVisualization = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [assignments, setAssignments] = useState([]);
    const [appCapacities, setAppCapacities] = useState({
        'App A': { current: 50, max: 50 },
        'App B': { current: 50, max: 50 },
        'App C': { current: 50, max: 50 },
        'App D': { current: 50, max: 50 },
        'App E': { current: 50, max: 50 }
    });
    const [sortedApps, setSortedApps] = useState(['App A', 'App B', 'App C', 'App D', 'App E']);

    const userPreinstalledApps = {
        'User 1': ['App A', 'App B'],
        'User 2': ['App B', 'App C'],
        'User 3': ['App A', 'App D'],
        'User 4': ['App C', 'App E'],
        'User 5': ['App B', 'App D'],
        'User 6': ['App A', 'App E'],
        'User 7': ['App C', 'App D'],
        'User 8': ['App A', 'App C']
    };

    const users = Object.keys(userPreinstalledApps);

    const reset = () => {
        setCurrentStep(0);
        setAssignments([]);
        setAppCapacities({
            'App A': { current: 50, max: 50 },
            'App B': { current: 50, max: 50 },
            'App C': { current: 50, max: 50 },
            'App D': { current: 50, max: 50 },
            'App E': { current: 50, max: 50 }
        });
        setSortedApps(['App A', 'App B', 'App C', 'App D', 'App E']);
    };

    const sortAppsByCapacity = (capacities) =>
        Object.keys(capacities).sort((a, b) => capacities[b].current - capacities[a].current);

    const getMaxCapacityApp = (excludeApps, capacities) => {
        const available = Object.keys(capacities).filter((app) => !excludeApps.includes(app));
        if (available.length === 0) return null;
        return available.reduce(
            (maxApp, app) => (capacities[app].current > capacities[maxApp].current ? app : maxApp),
            available[0]
        );
    };

    const processNextUser = () => {
        if (currentStep >= users.length) return;

        const currentUser = users[currentStep];
        const preinstalled = userPreinstalledApps[currentUser];

        const newCapacities = JSON.parse(JSON.stringify(appCapacities));
        const usedApps = [];
        const usedPreinstalled = [];

        // Use the first preinstalled app until empty, then next, etc.
        for (const app of preinstalled) {
            while (newCapacities[app].current > 0) {
                newCapacities[app].current -= 1;
                usedApps.push(app);
                usedPreinstalled.push(app);
            }
        }

        let extraApp = null; // keep types loose for canvas; adjust in TS projects

        // If no preinstalled capacity was available → pick an extra app with max remaining capacity
        if (usedApps.length === 0) {
            extraApp = getMaxCapacityApp(preinstalled, newCapacities);
            if (extraApp && newCapacities[extraApp].current > 0) {
                newCapacities[extraApp].current -= 1;
                usedApps.push(extraApp);
            }
        }

        setAssignments((prev) => [
            ...prev,
            {
                user: currentUser,
                apps: usedApps,
                preinstalled,
                usedPreinstalled: [...new Set(usedPreinstalled)],
                extraApp,
                capacitiesAfter: JSON.parse(JSON.stringify(newCapacities)),
                transactions: usedApps.length,
            },
        ]);

        setAppCapacities(newCapacities);
        setSortedApps(sortAppsByCapacity(newCapacities));
        setCurrentStep((prev) => prev + 1);
    };

    const getAppColor = (appName) => {
        const colors = {
            'App A': 'bg-blue-500',
            'App B': 'bg-green-500',
            'App C': 'bg-purple-500',
            'App D': 'bg-orange-500',
            'App E': 'bg-pink-500',
        };
        return colors[appName] || 'bg-slate-500';[appName] || 'bg-slate-500';
    };

    const getCapacityColor = (current, max) => {
        const percentage = (current / max) * 100;
        if (percentage > 70) return 'bg-green-500';
        if (percentage > 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-2 text-center">CARL Algorithm Visualization</h1>
                <p className="text-slate-300 text-center mb-6">Capacity-Aware Reuse-first Layered Allocation</p>

                {/* ✅ CURRENT USER DETAILS SECTION */}
                {currentStep < users.length ? (
                    <div className="bg-slate-800 border border-cyan-500 rounded-xl p-6 mb-6 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">Current User</h2>
                        <div className="flex items-center justify-center gap-6 mb-4">
                            <div className="bg-cyan-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold">
                                {currentStep + 1}
                            </div>
                            <div>
                                <div className="text-white text-2xl font-semibold">{users[currentStep]}</div>
                                <div className="text-slate-400 text-sm">User Index: {currentStep}</div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg text-cyan-300 font-semibold mb-2 text-center">Preinstalled Apps</h3>
                            <div className="flex gap-3 justify-center flex-wrap">
                                {userPreinstalledApps[users[currentStep]].map((app, i) => (
                                    <div key={app} className="flex flex-col items-center">
                                        <div className={`${getAppColor(app)} text-white px-4 py-2 rounded-lg font-semibold`}>{app}</div>
                                        <div className="text-slate-400 text-xs mt-1">
                                            {i === 0 ? 'Used first until empty' : 'Used next when previous is empty'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-700 p-4 rounded-lg text-center">
                            <p className="text-yellow-300 text-lg font-semibold">Transactions for this user</p>
                            <p className="text-white text-2xl font-bold mt-1">Will consume all capacity of preinstalled apps in order</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-900 rounded-lg p-6 text-center border-2 border-green-500 mb-6">
                        <p className="text-green-300 text-xl font-bold">✓ All Users Processed!</p>
                        <p className="text-green-400 text-sm mt-2">Check the assignment history below</p>
                    </div>
                )}

                {/* ✅ Controls */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={processNextUser}
                        disabled={currentStep >= users.length}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                    >
                        <Play size={20} />
                        {currentStep >= users.length ? 'Complete' : `Process ${users[currentStep]}`}
                    </button>
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        <RotateCcw size={20} /> Reset
                    </button>
                </div>

                {/* ✅ Apps Row */}
                <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">Applications (Sorted by Remaining Capacity)</h2>
                    <div className="flex justify-center items-start gap-6">
                        {sortedApps.map((appName, index) => (
                            <div key={appName} className="flex flex-col items-center transition-all duration-700">
                                <div className="text-yellow-400 text-sm font-bold mb-2">#{index + 1}</div>
                                <div className={`w-28 h-28 ${getAppColor(appName)} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg mb-3`}>{appName}</div>
                                <div className="w-full bg-slate-700 rounded-lg p-3">
                                    <div className="text-white text-sm font-semibold mb-2 text-center">Capacity</div>
                                    <div className="w-full bg-slate-600 rounded-full h-5 overflow-hidden mb-2">
                                        <div
                                            className={`h-full ${getCapacityColor(appCapacities[appName].current, appCapacities[appName].max)} transition-all`}
                                            style={{ width: `${(appCapacities[appName].current / appCapacities[appName].max) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-slate-300 text-sm text-center font-mono">
                                        {appCapacities[appName].current} / {appCapacities[appName].max}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ✅ Assignment History */}
                {assignments.length > 0 && (
                    <div className="bg-slate-800 rounded-xl p-6 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4 text-center">Assignment History</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {assignments.map((assignment, idx) => (
                                <div key={idx} className="bg-slate-700 rounded-lg p-4 border-l-4 border-cyan-500">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-cyan-600 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold">{idx + 1}</div>
                                        <div>
                                            <div className="text-white font-semibold text-lg">{assignment.user}</div>
                                            <div className="text-slate-400 text-sm">Preinstalled: {assignment.preinstalled.join(', ')}</div>
                                            <div className="text-yellow-400 text-sm font-bold">Transactions: {assignment.transactions}</div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="text-slate-300 text-sm font-semibold mb-2">Apps Used:</div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {assignment.apps.map((app, i) => (
                                                <div
                                                    key={`${app}-${i}`}
                                                    className={`${getAppColor(app)} ${app === assignment.extraApp ? 'ring-4 ring-yellow-400' : ''} px-4 py-2 rounded-lg text-white text-sm font-semibold`}
                                                >
                                                    {app}
                                                    {assignment.usedPreinstalled.includes(app) && (
                                                        <span className="ml-1 text-blue-200 text-xs">(preinstalled)</span>
                                                    )}
                                                    {app === assignment.extraApp && <span className="ml-1 text-yellow-300">★</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {assignment.extraApp && (
                                        <div className="bg-slate-600 rounded p-2 text-sm">
                                            <span className="text-yellow-400 font-semibold">Extra App Selected:</span>
                                            <span className="text-white ml-2">{assignment.extraApp}</span>
                                            <span className="text-slate-300 ml-2">(max remaining capacity)</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ✅ Legend */}
                <div className="mt-6 bg-slate-800 rounded-xl p-4">
                    <div className="flex justify-center gap-8 text-sm flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded" />
                            <span className="text-slate-300">Preinstalled Apps</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-400 rounded ring-2 ring-yellow-400" />
                            <span className="text-slate-300">Extra App (Max Capacity) ★</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-yellow-400 font-bold">#1</div>
                            <span className="text-slate-300">Apps ranked by capacity</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CARLVisualization;
