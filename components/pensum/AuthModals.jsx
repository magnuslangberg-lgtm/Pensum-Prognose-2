import React, { useState, useCallback } from 'react';
import { PENSUM_COLORS } from '../../lib/pensumCore';

export function LoginModal({ onClose, onSwitchToRegister, onLogin, authFeilmelding }) {
  const [epost, setEpost] = useState('');
  const [pin, setPin] = useState('');

  const handleLogin = useCallback(() => {
    onLogin(epost, pin);
  }, [epost, pin, onLogin]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.darkBlue }}>
          <h3 className="text-lg font-semibold text-white">Logg inn eller registrer deg</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            For å lagre kunder må du logge inn. Har du ikke bruker? Registrer deg gratis.
          </p>

          {authFeilmelding && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {authFeilmelding}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
              <input
                type="email"
                value={epost}
                onChange={(e) => setEpost(e.target.value)}
                placeholder="din@epost.no"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN-kode</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleLogin}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: PENSUM_COLORS.darkBlue }}
            >
              Logg inn
            </button>
            <button
              onClick={onSwitchToRegister}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
            >
              Ny bruker
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Avbryt
          </button>
        </div>
      </div>
    </div>
  );
}

export function RegisterModal({ onClose, onSwitchToLogin, onRegister, authFeilmelding }) {
  const [navn, setNavn] = useState('');
  const [epost, setEpost] = useState('');
  const [pin, setPin] = useState('');

  const handleRegister = useCallback(() => {
    onRegister(navn, epost, pin);
  }, [navn, epost, pin, onRegister]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-6 py-4" style={{ backgroundColor: PENSUM_COLORS.teal }}>
          <h3 className="text-lg font-semibold text-white">Opprett ny bruker</h3>
        </div>
        <div className="p-6">
          {authFeilmelding && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {authFeilmelding}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ditt navn</label>
              <input
                type="text"
                value={navn}
                onChange={(e) => setNavn(e.target.value)}
                placeholder="Ola Nordmann"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
              <input
                type="email"
                value={epost}
                onChange={(e) => setEpost(e.target.value)}
                placeholder="din@epost.no"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Velg PIN-kode (minst 4 tegn)</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              />
            </div>
          </div>

          <button
            onClick={handleRegister}
            className="w-full mt-6 py-2.5 px-4 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: PENSUM_COLORS.teal }}
          >
            Opprett bruker
          </button>

          <button
            onClick={onSwitchToLogin}
            className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Har allerede bruker? Logg inn
          </button>
        </div>
      </div>
    </div>
  );
}
