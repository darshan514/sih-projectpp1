import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2,
  Maximize2
} from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language: string;
}

interface HealthChatbotProps {
  language: string;
}

const HealthChatbot = ({ language }: HealthChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const translations = {
    en: {
      title: "Health Assistant",
      placeholder: "Ask about your health...",
      send: "Send",
      typing: "AI is typing...",
      greeting: "Hello! I'm your health assistant. How can I help you today?",
      examples: [
        "When is my next vaccination?",
        "What medications am I taking?",
        "Explain my medical report",
        "Health tips for construction workers"
      ]
    },
    ml: {
      title: "ആരോഗ്യ സഹായി",
      placeholder: "നിങ്ങളുടെ ആരോഗ്യത്തെക്കുറിച്ച് ചോദിക്കുക...",
      send: "അയയ്ക്കുക",
      typing: "AI ടൈപ്പ് ചെയ്യുന്നു...",
      greeting: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ആരോഗ്യ സഹായിയാണ്. ഇന്ന് ഞാൻ എങ്ങനെ സഹായിക്കാം?",
      examples: [
        "എന്റെ അടുത്ത വാക്സിനേഷൻ എപ്പോഴാണ്?",
        "ഞാൻ എന്ത് മരുന്നുകളാണ് കഴിക്കുന്നത്?",
        "എന്റെ മെഡിക്കൽ റിപ്പോർട്ട് വിശദീകരിക്കുക",
        "നിർമ്മാണ തൊഴിലാളികൾക്കുള്ള ആരോഗ്യ നുറുങ്ങുകൾ"
      ]
    },
    bn: {
      title: "স্বাস্থ্য সহায়ক",
      placeholder: "আপনার স্বাস্থ্য সম্পর্কে জিজ্ঞাসা করুন...",
      send: "পাঠান",
      typing: "AI টাইপ করছে...",
      greeting: "নমস্কার! আমি আপনার স্বাস্থ্য সহায়ক। আজ আমি কীভাবে আপনাকে সাহায্য করতে পারি?",
      examples: [
        "আমার পরবর্তী টিকা কবে?",
        "আমি কী ওষুধ খাচ্ছি?",
        "আমার মেডিকেল রিপোর্ট ব্যাখ্যা করুন",
        "নির্মাণ শ্রমিকদের জন্য স্বাস্থ্য টিপস"
      ]
    }
  };

  const t = translations[language as keyof typeof translations];

  const healthResponses = {
    en: {
      vaccination: "Based on your records, your next Hepatitis B vaccination is due on December 1st, 2024. Please visit the nearest health center.",
      medication: "You are currently taking Multivitamin - 1 tablet daily as prescribed by Dr. Priya Menon.",
      report: "Your recent checkup shows good overall health. Blood pressure and basic vitals are normal.",
      tips: "As a construction worker: 1) Drink plenty of water 2) Use protective equipment 3) Take breaks in shade 4) Watch for heat exhaustion symptoms",
      general: "I'm here to help with your health questions. You can ask about vaccinations, medications, medical reports, or health tips."
    },
    ml: {
      vaccination: "നിങ്ങളുടെ രേഖകൾ പ്രകാരം, നിങ്ങളുടെ അടുത്ത ഹെപ്പറ്റൈറ്റിസ് ബി വാക്സിനേഷൻ ഡിസംബർ 1, 2024 ന് നിശ്ചയിച്ചിരിക്കുന്നു. ദയവായി അടുത്തുള്ള ആരോഗ്യ കേന്ദ്രം സന്ദർശിക്കുക.",
      medication: "ഡോ. പ്രിയ മേനോൻ നിർദ്ദേശിച്ചതുപോലെ നിങ്ങൾ നിലവിൽ മൾട്ടിവിറ്റാമിൻ - ദിവസവും 1 ടാബ്ലെറ്റ് കഴിക്കുന്നു.",
      report: "നിങ്ങളുടെ പുതിയ പരിശോധന നല്ല മൊത്തത്തിലുള്ള ആരോഗ്യം കാണിക്കുന്നു. രക്തസമ്മർദ്ദവും അടിസ്ഥാന ജീവിത സൂചകങ്ങളും സാധാരണമാണ്.",
      tips: "ഒരു നിർമ്മാണ തൊഴിലാളി എന്ന നിലയിൽ: 1) ധാരാളം വെള്ളം കുടിക്കുക 2) സംരക്ഷണ ഉപകരണങ്ങൾ ഉപയോഗിക്കുക 3) തണലിൽ വിശ്രമിക്കുക 4) ചൂട് ക്ഷീണത്തിന്റെ ലക്ഷണങ്ങൾ ശ്രദ്ധിക്കുക",
      general: "നിങ്ങളുടെ ആരോഗ്യ ചോദ്യങ്ങളിൽ സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്. വാക്സിനേഷൻ, മരുന്നുകൾ, മെഡിക്കൽ റിപ്പോർട്ടുകൾ അല്ലെങ്കിൽ ആരോഗ്യ നുറുങ്ങുകൾ എന്നിവയെക്കുറിച്ച് നിങ്ങൾക്ക് ചോദിക്കാം."
    },
    bn: {
      vaccination: "আপনার রেকর্ড অনুযায়ী, আপনার পরবর্তী হেপাটাইটিস বি টিকা ১ ডিসেম্বর, ২০২৪ তারিখে নির্ধারিত। দয়া করে নিকটতম স্বাস্থ্য কেন্দ্র পরিদর্শন করুন।",
      medication: "ডা. প্রিয়া মেনন দ্বারা নির্ধারিত অনুযায়ী আপনি বর্তমানে মাল্টিভিটামিন - দৈনিক ১টি ট্যাবলেট খাচ্ছেন।",
      report: "আপনার সাম্প্রতিক পরীক্ষা ভাল সামগ্রিক স্বাস্থ্য দেখায়। রক্তচাপ এবং মৌলিক জীবনী শক্তি স্বাভাবিক।",
      tips: "একজন নির্মাণ শ্রমিক হিসেবে: ১) প্রচুর পানি পান করুন ২) সুরক্ষা সরঞ্জাম ব্যবহার করুন ৩) ছায়ায় বিশ্রাম নিন ৪) তাপ ক্লান্তির লক্ষণগুলি লক্ষ্য করুন",
      general: "আমি আপনার স্বাস্থ্য প্রশ্নে সাহায্য করতে এখানে আছি। আপনি টিকা, ওষুধ, মেডিকেল রিপোর্ট বা স্বাস্থ্য টিপস সম্পর্কে জিজ্ঞাসা করতে পারেন।"
    }
  };

  const responses = healthResponses[language as keyof typeof healthResponses];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add greeting message when chatbot opens for the first time
      const greetingMessage: Message = {
        id: Date.now().toString(),
        text: t.greeting,
        sender: 'bot',
        timestamp: new Date(),
        language
      };
      setMessages([greetingMessage]);
    }
  }, [isOpen, t.greeting, language, messages.length]);

  const getResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('vaccination') || lowerMessage.includes('vaccine') || 
        lowerMessage.includes('വാക്സിന') || lowerMessage.includes('টিকা')) {
      return responses.vaccination;
    } else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine') || 
               lowerMessage.includes('মরুন্ন') || lowerMessage.includes('ওষুধ')) {
      return responses.medication;
    } else if (lowerMessage.includes('report') || lowerMessage.includes('রিপোর্ট') || 
               lowerMessage.includes('রিপোর্ট')) {
      return responses.report;
    } else if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || 
               lowerMessage.includes('নুറুঙ্গ') || lowerMessage.includes('টিপস')) {
      return responses.tips;
    } else {
      return responses.general;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
      language
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getResponse(input),
        sender: 'bot',
        timestamp: new Date(),
        language
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg z-50"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-80 shadow-2xl z-50 transition-all duration-300 ${
      isMinimized ? 'h-14' : 'h-96'
    }`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          {t.title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-4 pt-0 flex flex-col h-80">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
                {t.examples.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto p-2 text-xs"
                    onClick={() => handleExampleClick(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === 'bot' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {message.sender === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <span>{message.text}</span>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground rounded-lg p-3 text-sm flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <span>{t.typing}</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.placeholder}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} size="sm" disabled={!input.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default HealthChatbot;