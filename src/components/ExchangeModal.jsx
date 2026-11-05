import React, { useState } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Check, 
  Calendar, 
  User, 
  Send
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#282a2d] text-[#e3e3e3] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#3c4043] animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#202124] border-b border-[#3c4043] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fdd663] text-[#1f1f1f] flex items-center justify-center shadow-xs">
              <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#e3e3e3]">Wymiana terminami z kolegą</h3>
              <p className="text-xs text-[#9aa0a6]">Wymieniajcie się terminami spotkań i dyżurów w czasie rzeczywistym</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#9aa0a6] hover:bg-[#35373a] hover:text-[#e3e3e3] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#3c4043] px-6 pt-3 space-x-6 bg-[#282a2d]">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'incoming' 
                ? 'border-[#fdd663] text-[#fdd663]' 
                : 'border-transparent text-[#9aa0a6] hover:text-[#e3e3e3]'
            }`}
          >
            <span>Otrzymane prośby</span>
            {incomingExchanges.length > 0 && (
              <span className="w-5 h-5 bg-[#f28b82] text-[#1f1f1f] text-xs font-bold rounded-full flex items-center justify-center">
                {incomingExchanges.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('outgoing')}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'outgoing' 
                ? 'border-[#fdd663] text-[#fdd663]' 
                : 'border-transparent text-[#9aa0a6] hover:text-[#e3e3e3]'
            }`}
          >
            <span>Wysłane propozycje</span>
            <span className="text-xs bg-[#35373a] text-[#c4c7c5] px-2 py-0.5 rounded-full font-medium">
              {outgoingExchanges.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('new')}
            className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'new' 
                ? 'border-[#fdd663] text-[#fdd663]' 
                : 'border-transparent text-[#9aa0a6] hover:text-[#e3e3e3]'
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
                <div className="py-12 text-center text-[#9aa0a6]">
                  <ArrowLeftRight className="w-10 h-10 mx-auto text-[#5f6368] mb-2" />
                  <p className="text-sm font-medium">Brak oczekujących próśb o wymianę</p>
                  <p className="text-xs mt-1">Gdy znajomy wyśle propozycję zamiany terminu, pojawi się tutaj.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingExchanges.map((ex) => (
                    <div key={ex.id} className="p-4 bg-[#202124] border border-[#3c4043] rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-[#8ab4f8]" />
                          <span className="text-sm font-bold text-[#e3e3e3]">{ex.fromUserName || ex.fromUserEmail}</span>
                          <span className="text-xs text-[#9aa0a6]">chce zamienić terminy</span>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#433519] text-[#fdd663]">
                          Oczekuje
                        </span>
                      </div>

                      {/* Swap cards comparison */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#282a2d] border border-[#3c4043] rounded-lg">
                        <div className="border-r border-[#3c4043] pr-2">
                          <span className="text-[10px] font-bold uppercase text-[#9aa0a6]">Oddaje Ci swój termin:</span>
                          <p className="text-sm font-bold text-[#8ab4f8]">{ex.myEventTitle}</p>
                          <p className="text-xs text-[#9aa0a6] flex items-center space-x-1 mt-1">
                            <Calendar className="w-3 h-3 text-[#5f6368]" />
                            <span>{ex.myEventDate} ({ex.myEventTime})</span>
                          </p>
                        </div>
                        <div className="pl-2">
                          <span className="text-[10px] font-bold uppercase text-[#9aa0a6]">W zamian za Twój termin:</span>
                          <p className="text-sm font-bold text-[#81c995]">{ex.targetEventTitle}</p>
                          <p className="text-xs text-[#9aa0a6] flex items-center space-x-1 mt-1">
                            <Calendar className="w-3 h-3 text-[#5f6368]" />
                            <span>{ex.targetEventDate} ({ex.targetEventTime})</span>
                          </p>
                        </div>
                      </div>

                      {ex.message && (
                        <p className="text-xs text-[#c4c7c5] italic bg-[#35373a] p-2 rounded border border-[#3c4043]">
                          "{ex.message}"
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-end space-x-3 pt-2">
                        <button
                          onClick={() => onRespondExchange(ex.id, false, ex)}
                          className="px-4 py-1.5 border border-[#5f6368] hover:bg-[#35373a] text-[#e3e3e3] text-xs font-semibold rounded-lg transition"
                        >
                          Odrzuć
                        </button>
                        <button
                          onClick={() => onRespondExchange(ex.id, true, ex)}
                          className="px-4 py-1.5 bg-[#81c995] hover:bg-[#a8dab5] text-[#1f1f1f] text-xs font-bold rounded-lg shadow-sm transition flex items-center space-x-1"
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
                <div className="py-12 text-center text-[#9aa0a6]">
                  <p className="text-sm font-medium">Brak wysłanych propozycji</p>
                  <p className="text-xs mt-1">Przejdź do zakładki "Zaproponuj nową wymianę", aby wysłać propozycję.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {outgoingExchanges.map((ex) => (
                    <div key={ex.id} className="p-3.5 border border-[#3c4043] rounded-xl bg-[#202124] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#9aa0a6]">
                          Wysłano do: <strong className="text-[#e3e3e3]">{ex.targetUserEmail || "Kolega"}</strong>
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          ex.status === 'accepted' ? 'bg-[#133926] text-[#81c995]' :
                          ex.status === 'rejected' ? 'bg-[#4c1f24] text-[#f28b82]' :
                          'bg-[#433519] text-[#fdd663]'
                        }`}>
                          {ex.status === 'accepted' ? 'Zaakceptowana ✓' :
                           ex.status === 'rejected' ? 'Odrzucona ✗' : 'Oczekuje...'}
                        </span>
                      </div>
                      <div className="text-xs text-[#c4c7c5] grid grid-cols-2 gap-2 bg-[#282a2d] p-2 rounded">
                        <div>
                          <span className="text-[10px] text-[#9aa0a6] block font-bold">Oferujesz:</span>
                          <span className="font-medium text-[#e3e3e3]">{ex.myEventTitle}</span> ({ex.myEventDate})
                        </div>
                        <div>
                          <span className="text-[10px] text-[#9aa0a6] block font-bold">W zamian za:</span>
                          <span className="font-medium text-[#e3e3e3]">{ex.targetEventTitle}</span> ({ex.targetEventDate})
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
                <label className="block text-xs font-semibold text-[#9aa0a6] mb-1">
                  1. Wybierz swój termin, który chcesz oddać:
                </label>
                {myEvents.length === 0 ? (
                  <p className="text-xs text-[#f28b82] bg-[#4c1f24] p-2.5 rounded-lg border border-[#f28b82]/30">
                    Nie masz jeszcze żadnych utworzonych terminów w kalendarzu. Dodaj najpierw termin!
                  </p>
                ) : (
                  <select
                    value={selectedMyEventId}
                    onChange={(e) => setSelectedMyEventId(e.target.value)}
                    required
                    className="w-full bg-[#1f1f1f] border border-[#5f6368] rounded-lg p-2.5 text-sm text-[#e3e3e3] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
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
                <label className="block text-xs font-semibold text-[#9aa0a6] mb-1">
                  2. Wybierz termin kolegi, który chcesz otrzymać:
                </label>
                {exchangeableEvents.length === 0 ? (
                  <p className="text-xs text-[#fdd663] bg-[#433519] p-2.5 rounded-lg border border-[#fdd663]/30">
                    Brak publicznych terminów oznaczonych do wymiany. Poproś znajomego o zaznaczenie "Udostępnij na wymianę" w swoim wydarzeniu!
                  </p>
                ) : (
                  <select
                    value={selectedTargetEventId}
                    onChange={(e) => setSelectedTargetEventId(e.target.value)}
                    required
                    className="w-full bg-[#1f1f1f] border border-[#5f6368] rounded-lg p-2.5 text-sm text-[#e3e3e3] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
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
                <label className="block text-xs font-semibold text-[#9aa0a6] mb-1">
                  Wiadomość do kolegi (opcjonalnie):
                </label>
                <input
                  type="text"
                  placeholder="np. Cześć! Bardzo zależy mi na tym terminie, zamienisz się?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#1f1f1f] border border-[#5f6368] rounded-lg p-2 text-sm text-[#e3e3e3] focus:ring-1 focus:ring-[#8ab4f8] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#3c4043] flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || myEvents.length === 0 || exchangeableEvents.length === 0}
                  className="px-5 py-2.5 bg-[#fdd663] hover:bg-[#ffe082] text-[#1f1f1f] rounded-lg text-sm font-bold transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
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
