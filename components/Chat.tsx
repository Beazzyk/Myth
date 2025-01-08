import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react'; // Dodajemy ikonę "send" z Lucide (można użyć innej biblioteki)

interface ChatMessage {
  id: number;
  character_name: string;
  message: string;
  created_at: string; // Zakładamy, że ta wartość jest datą w formacie ISO
  map_id: number;
  channel: string; // Kanał wiadomości (globalny, mapa, grupa, klan)
}

interface ChatProps {
  mapId: number;
  characterId: number;
  characterName: string;
  mapName: string;
}

// Zmieniona kolejność kanałów: Mapa jako pierwsza, Globalny na końcu
const channels = ['mapa', 'grupa', 'klan', 'globalny'];

const Chat: React.FC<ChatProps> = ({ mapId, characterId, characterName, mapName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentChannel, setCurrentChannel] = useState('mapa'); // Domyślnie wybrany kanał "Mapa"
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Funkcja do usunięcia wiadomości starszych niż 6 godzin
  const filterOldMessages = (messages: ChatMessage[]) => {
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 godzin temu
    return messages.filter((msg) => new Date(msg.created_at) >= sixHoursAgo);
  };

  // Funkcja do sprawdzenia, czy wiadomość jest starsza niż 6 godzin (do stylistycznej zmiany koloru)
  const isOldMessage = (createdAt: string) => {
    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    return new Date(createdAt) < sixHoursAgo;
  };

  // Fetch previous messages when component loads
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/chat/${mapId}`);
        if (!response.ok) {
          throw new Error('Error fetching messages');
        }
        const data = await response.json();
        const filteredMessages = filterOldMessages(data); // Filtrujemy stare wiadomości
        setMessages(filteredMessages); // Zapisujemy pobrane wiadomości do stanu
      } catch (error) {
        console.error('Failed to fetch chat messages:', error);
      }
    };
    fetchMessages();
  }, [mapId]);

  // Auto-scroll to the bottom of the chat window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Wysłanie wiadomości na wybrany kanał
  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mapId,
          characterId,
          message: newMessage,
          channel: currentChannel, // Wysyłanie wiadomości na wybrany kanał
        }),
      });

      if (!response.ok) {
        throw new Error('Error sending message');
      }

      const sentMessage = await response.json();

      // Natychmiastowe dodanie wiadomości do stanu lokalnego
      const newMessageObj: ChatMessage = {
        id: sentMessage.id,
        character_name: characterName, // Wyświetlamy nazwę postaci, która wysłała wiadomość
        message: newMessage, // Wysłana wiadomość
        created_at: new Date().toISOString(), // Aktualna data
        map_id: mapId,
        channel: currentChannel,
      };

      // Dodanie nowej wiadomości do lokalnej listy, bez czekania na odpowiedź z serwera
      setMessages((prevMessages) => filterOldMessages([...prevMessages, newMessageObj]));

      // Wyczyść pole tekstowe po wysłaniu wiadomości
      setNewMessage('');

    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Dodanie wiadomości o zmianie mapy w języku polskim
  useEffect(() => {
    const mapChangeMessage = {
      id: Date.now(),
      character_name: '',
      message: `Wszedłeś na mapę ${mapName}`, // Komunikat o zmianie mapy
      created_at: new Date().toISOString(),
      map_id: mapId,
      channel: 'mapa', // Komunikat pojawia się na kanale "mapa"
    };
    setMessages((prevMessages) => [...prevMessages, mapChangeMessage]);
  }, [mapId, mapName]);

  // Handle sending message on Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Filtr wiadomości w zależności od wybranej zakładki chatu
  const filteredMessages = messages.filter((msg) => msg.channel === currentChannel);

  return (
    <div className="chat-container" style={{
      position: 'absolute',
      bottom: '0',
      left: '0',
      width: '256px', // Szerokość jak w RightPanel
      height: '100%', // Chat na całej długości okna gry
      backgroundColor: 'rgba(0,0,0,0.5)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '5px',
    }}>
      {/* Zakładki chatu */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '5px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        {channels.map((channel) => (
          <button
            key={channel}
            onClick={() => setCurrentChannel(channel)}
            style={{
              backgroundColor: currentChannel === channel ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {channel.charAt(0).toUpperCase() + channel.slice(1)}
          </button>
        ))}
      </div>

      {/* Wiadomości */}
      <div ref={messagesEndRef} className="chat-messages" style={{
        flexGrow: 1,
        padding: '10px',
        overflowY: 'auto',
        wordWrap: 'break-word', // Zawijanie tekstu
        fontSize: '12px', // Zmniejszenie rozmiaru czcionki
      }}>
        {/* Wyświetlanie wiadomości */}
        {filteredMessages.map((msg) => (
          <div key={msg.id} className="mb-2" style={{
            color: isOldMessage(msg.created_at) ? 'gray' : 'white' // Starsze wiadomości są bardziej szare
          }}>
            <strong style={{
              color: msg.character_name === characterName ? 'gold' : 'white', // Złoty kolor dla nicku użytkownika
              fontSize: '12px',
            }}>
              {msg.character_name && `${msg.character_name}: `}
            </strong>
            <span style={{ fontSize: '12px' }}>{msg.message}</span>
          </div>
        ))}

        {/* Placeholdery dla grupy, klanu i globalnego */}
        {currentChannel === 'grupa' && (
          <div className="text-gray-400">System: Chat grupowy jest obecnie niedostępny.</div>
        )}
        {currentChannel === 'klan' && (
          <div className="text-gray-400">System: Chat klanowy jest obecnie niedostępny.</div>
        )}
        {currentChannel === 'globalny' && (
          <div className="text-gray-400">System: Chat globalny jest obecnie niedostępny.</div>
        )}
      </div>

      {/* Input do wpisywania wiadomości */}
      <div className="chat-input" style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Napisz wiadomość..."
          style={{
            flexGrow: 1,
            padding: '5px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            border: 'none',
            color: 'white',
            outline: 'none',
          }}
        />
        <button onClick={sendMessage} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '5px' }}>
          <Send color="white" size={18} />
        </button>
      </div>
    </div>
  );
};

export default Chat;
