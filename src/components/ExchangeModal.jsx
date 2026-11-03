import React, { useState } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Check, 
  XCircle, 
  Clock, 
  Calendar, 
  User, 
  Send,
  AlertCircle
} from 'lucide-react';

export default function ExchangeModal({
  isOpen,
  onClose,
  myEvents,
  exchangeableEvents,
  exchanges,
  onProposeExchange,
  onRespondExchange,
  user,
  initialTargetEvent
}) {
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming', 'outgoing', 'new'
  const [selectedMyEventId, setSelectedMyEventId] = useState('');
  const [selectedTargetEventId, setSelectedTargetEventId] = useState(initialTargetEvent?.id || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialTargetEvent) {
      setSelectedTargetEventId(initialTargetEvent.id);
      setActiveTab('new');
    }
  }, [initialTargetEvent]);

  if (!isOpen) return null;

  const incomingExchanges = exchanges.filter(ex => 
    (ex.targetUserId === user?.uid || (user?.email && ex.targetUserEmail?.toLowerCase() === user.email.toLowerCase())) &&
    ex.status === 'pending'
  );

  const outgoingExchanges = exchanges.filter(ex => ex.fromUserId === user?.uid);

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    if (!selectedMyEventId || !selectedTargetEventId) {
      alert('Wybierz swój termin oraz termin znajomego do wymiany.');
      return;
    }

    const myEvent = myEvents.find(ev => ev.id === selectedMyEventId);
    const targetEvent = exchangeableEvents.find(ev => ev.id === selectedTargetEventId);

    if (!myEvent || !targetEvent) return;

    setSubmitting(true);
    try {
      await onProposeExchange({
        myEventId: myEvent.id,
        myEventTitle: myEvent.title,
        myEventDate: myEvent.date,
        myEventTime: `${myEvent.startTime || ''} - ${myEvent.endTime || ''}`,
        targetEventId: targetEvent.id,
        targetEventTitle: targetEvent.title,
        targetEventDate: targetEvent.date,
        targetEventTime: `${targetEvent.startTime || ''} - ${targetEvent.endTime || ''}`,
        targetUserId: targetEvent.userId,
        targetUserEmail: targetEvent.userEmail || '',
        fromUserId: user?.uid,
        fromUserEmail: user?.email,
        fromUserName: user?.displayName || user?.email,
        message
      });
      alert('Propozycja wymiany została wysłana!');
      setActiveTab('outgoing');
      setMessage('');
    } catch (err) {
      console.error(err);
      alert('Nie udało się wysłać propozycji: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Wymiana terminami z kolegą</h3>
              <p className="text-xs text-amber-800">Wymieniajcie się terminami spotkań i dyżurów bezpośrednio w kalendarzu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-amber-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6 pt-3 space-x-6 bg-white">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'incoming' 
                ? 'border-amber-600 text-amber-700' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Otrzymane prośby</span>
            {incomingExchanges.length > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {incomingExchanges.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('outgoing')}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'outgoing' 
                ? 'border-amber-600 text-amber-700' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Wysłane propozycje</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {outgoingExchanges.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('new')}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'new' 
                ? 'border-amber-600 text-amber-700' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>Zaproponuj nową wymianę</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Incoming */}
          {activeTab === 'incoming' && (
            <div>
              {incomingExchanges.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <ArrowLeftRight className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-medium">Brak oczekujących próśb o wymianę</p>
                  <p className="text-xs mt-1">Gdy znajomy wyśle propozycję zamiany terminu, pojawi się tutaj.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingExchanges.map((ex) => (
                    <div key={ex.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-bold text-gray-900">{ex.fromUserName || ex.fromUserEmail}</span>
                          <span className="text-xs text-gray-500">chce zamienić terminy</span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Oczekuje
                        </span>
                      </div>

                      {/* Swap cards comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="border-r border-gray-100 pr-2">
                          <span className="text-[10px] font-bold uppercase text-gray-400">Oddaje Ci swój termin:</span>
                          <p className="text-sm font-bold text-blue-700">{ex.myEventTitle}</p>
                          <p className="text-xs text-gray-600 flex items-center space-x-1 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{ex.myEventDate} ({ex.myEventTime})</span>
                          </p>
                        </div>
                        <div className="pl-2">
                          <span className="text-[10px] font-bold uppercase text-gray-400">W zamian za Twój termin:</span>
                          <p className="text-sm font-bold text-emerald-700">{ex.targetEventTitle}</p>
                          <p className="text-xs text-gray-600 flex items-center space-x-1 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{ex.targetEventDate} ({ex.targetEventTime})</span>
                          </p>
                        </div>
                      </div>

                      {ex.message && (
                        <p className="text-xs text-gray-600 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                          "{ex.message}"
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-end space-x-3 pt-2">
                        <button
                          onClick={() => onRespondExchange(ex.id, false, ex)}
                          className="px-4 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition"
                        >
                          Odrzuć
                        </button>
                        <button
                          onClick={() => onRespondExchange(ex.id, true, ex)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Akceptuj wymianę</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Outgoing */}
          {activeTab === 'outgoing' && (
            <div>
              {outgoingExchanges.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <p className="text-sm font-medium">Brak wysłanych propozycji</p>
                  <p className="text-xs mt-1">Przejdź do zakładki "Zaproponuj nową wymianę", aby wysłać propozycję.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {outgoingExchanges.map((ex) => (
                    <div key={ex.id} className="p-3.5 border border-gray-200 rounded-xl bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">
                          Wysłano do: <strong className="text-gray-900">{ex.targetUserEmail || "Kolega"}</strong>
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          ex.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          ex.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {ex.status === 'accepted' ? 'Zaakceptowana ✓' :
                           ex.status === 'rejected' ? 'Odrzucona ✗' : 'Oczekuje...'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-bold">Oferujesz:</span>
                          <span className="font-medium text-gray-800">{ex.myEventTitle}</span> ({ex.myEventDate})
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block font-bold">W zamian za:</span>
                          <span className="font-medium text-gray-800">{ex.targetEventTitle}</span> ({ex.targetEventDate})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: New Proposal */}
          {activeTab === 'new' && (
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  1. Wybierz swój termin, który chcesz oddać:
                </label>
                {myEvents.length === 0 ? (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                    Nie masz jeszcze żadnych utworzonych terminów w kalendarzu. Dodaj najpierw termin!
                  </p>
                ) : (
                  <select
                    value={selectedMyEventId}
                    onChange={(e) => setSelectedMyEventId(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Wybierz swój termin --</option>
                    {myEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.date} {ev.startTime || ''})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  2. Wybierz termin kolegi, który chcesz otrzymać:
                </label>
                {exchangeableEvents.length === 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                    Brak publicznych terminów oznaczonych do wymiany. Poproś znajomego o zaznaczenie "Udostępnij na wymianę" w swoim wydarzeniu!
                  </p>
                ) : (
                  <select
                    value={selectedTargetEventId}
                    onChange={(e) => setSelectedTargetEventId(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Wybierz termin znajomego --</option>
                    {exchangeableEvents.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({ev.date} {ev.startTime || ''}) — od: {ev.userName || ev.userEmail}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Wiadomość do kolegi (opcjonalnie):
                </label>
                <input
                  type="text"
                  placeholder="np. Cześć! Bardzo zależy mi na tym terminie, zamienisz się?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || myEvents.length === 0 || exchangeableEvents.length === 0}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Wysyłanie...' : 'Wyślij propozycję wymiany'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
