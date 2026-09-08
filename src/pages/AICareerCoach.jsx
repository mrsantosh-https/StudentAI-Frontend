import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Swal from "sweetalert2";
import remarkGfm from "remark-gfm";
import {
  FiClock,
  FiCopy,
  FiMessageSquare,
  FiRefreshCw,
  FiSend,
  FiThumbsDown,
  FiThumbsUp,
  FiTrash2,
} from "react-icons/fi";

import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useUser } from "../context/UserContext";
import axios from "axios";
import "../styles/aiCareerCoach.css";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const SUGGESTIONS = [
  {
    label: "Web Developer Roadmap",
    prompt: "Create a complete web developer roadmap for a fresher.",
  },
  {
    label: "Interview Preparation",
    prompt:
      "Give me interview preparation tips for a fresher software developer.",
  },
  
];

export default function AICareerCoach() {
  const { user } = useUser();

  const welcomeMessage = useMemo(
    () => ({
      id: "welcome-message",
      role: "ai",
      text: `Hi ${
        user?.name || "User"
      } 👋 Main tumhara AI Career Coach hoon. Resume, jobs, interview preparation, career roadmap aur skills ke baare mein pooch sakte ho.`,
      chatId: null,
      isWelcome: true,
    }),
    [user?.name],
  );

  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");

  const [isTyping, setIsTyping] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deletingChatId, setDeletingChatId] = useState(null);

  const [history, setHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const [feedbackState, setFeedbackState] = useState({});

  const [historyOpen, setHistoryOpen] = useState(false);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  const getHeaders = useCallback(
    (includeContentType = false) => {
      const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      };

      if (includeContentType) {
        headers["Content-Type"] = "application/json";
      }

      return headers;
    },
    [getToken],
  );

  /*
  |--------------------------------------------------------------------------
  | Scroll chat to bottom
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  /*
  |--------------------------------------------------------------------------
  | Update welcome message after user data loads
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setMessages((currentMessages) => {
      const hasOnlyWelcomeMessage =
        currentMessages.length === 1 && currentMessages[0]?.isWelcome;

      if (hasOnlyWelcomeMessage) {
        return [welcomeMessage];
      }

      return currentMessages;
    });
  }, [welcomeMessage]);

  /*
  |--------------------------------------------------------------------------
  | Fetch history
  |--------------------------------------------------------------------------
  */

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);

      const response = await fetch(`${API_URL}/ai-chats`, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.reply || "Chat history load nahi ho saki.",
        );
      }

      const chats = Array.isArray(data.chats) ? data.chats : [];

      setHistory(chats);

      const feedbackMap = {};

      chats.forEach((chat) => {
        feedbackMap[chat.id] = {
          liked: Boolean(chat.liked),
          disliked: Boolean(chat.disliked),
        };
      });

      setFeedbackState(feedbackMap);

      return chats;
    } catch (error) {
      console.error("History load error:", error);

      toast.error(error.message || "Chat history load nahi ho saki.");

      return [];
    } finally {
      setHistoryLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /*
  |--------------------------------------------------------------------------
  | Start new chat
  |--------------------------------------------------------------------------
  */

  const startNewChat = () => {
    if (isTyping) {
      toast.error("AI response complete hone ka wait karein.");
      return;
    }

    setSelectedChatId(null);
    setMessages([welcomeMessage]);
    setInput("");
    setCopiedMessageId(null);
    setHistoryOpen(false);

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  /*
  |--------------------------------------------------------------------------
  | Open saved chat
  |--------------------------------------------------------------------------
  */

  const openHistoryChat = (chat) => {
    if (isTyping) {
      toast.error("AI response complete hone ka wait karein.");
      return;
    }

    setSelectedChatId(chat.id);
    setInput("");
    setCopiedMessageId(null);
    setHistoryOpen(false);

    setMessages([
      {
        id: `user-${chat.id}`,
        role: "user",
        text: chat.question || "Question available nahi hai.",
        chatId: chat.id,
        isWelcome: false,
      },
      {
        id: `ai-${chat.id}`,
        role: "ai",
        text: chat.answer || "Answer available nahi hai.",
        chatId: chat.id,
        isWelcome: false,
      },
    ]);
  };

  /*
  |--------------------------------------------------------------------------
  | Copy response
  |--------------------------------------------------------------------------
  */

  const copyText = async (text, messageId) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        document.execCommand("copy");

        document.body.removeChild(textarea);
      }

      setCopiedMessageId(messageId);

      window.setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Text copy nahi ho saka.");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Save like/dislike
  |--------------------------------------------------------------------------
  */

  const saveFeedback = async (chatId, type) => {
    if (!chatId) {
      toast.error("Pehle chat save hone dein.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/ai-chats/${chatId}/feedback`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Feedback save nahi ho saka.");
      }

      setFeedbackState((currentState) => ({
        ...currentState,
        [chatId]: {
          liked: type === "like",
          disliked: type === "dislike",
        },
      }));

      setHistory((currentHistory) =>
        currentHistory.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                liked: type === "like",
                disliked: type === "dislike",
              }
            : chat,
        ),
      );

      toast.success(type === "like" ? "Response liked" : "Feedback saved");
    } catch (error) {
      console.error("Feedback error:", error);

      toast.error(error.message || "Feedback save nahi ho saka.");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Delete history
  |--------------------------------------------------------------------------
  */

  const deleteHistoryChat = async (event, chatId) => {
    event.stopPropagation();

    const confirmed = window.confirm(
      "Kya aap is chat ko delete karna chahte hain?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingChatId(chatId);

      const response = await fetch(`${API_URL}/ai-chats/${chatId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Chat delete nahi ho saki.");
      }

      setHistory((currentHistory) =>
        currentHistory.filter((chat) => chat.id !== chatId),
      );

      setFeedbackState((currentState) => {
        const updatedState = { ...currentState };
        delete updatedState[chatId];
        return updatedState;
      });

      if (selectedChatId === chatId) {
        setSelectedChatId(null);
        setMessages([welcomeMessage]);
      }

      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Delete chat error:", error);

      toast.error(error.message || "Chat delete nahi ho saki.");
    } finally {
      setDeletingChatId(null);
    }
  };

 const clearAllHistory = async () => {
  const result = await Swal.fire({
    title: "Clear all history?",
    text: "All AI conversations will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, clear all",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#ef4444",
  });

  if (!result.isConfirmed) return;

  try {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
      `${API_URL}/ai-chats/clear-all`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setHistory([]);
      setMessages([welcomeMessage]);
      setSelectedChatId(null);
      setFeedbackState({});
      setHistoryOpen(false);

      toast.success(response.data.message);
    }
  } catch (error) {
    console.error("Clear history error:", error.response?.data || error);

    const message =
      error.response?.data?.message ||
      "Failed to clear history";

    toast.error(message);
  }
};
  /*
  |--------------------------------------------------------------------------
  | Send message
  |--------------------------------------------------------------------------
  */

  const sendMessage = async () => {
    const userText = input.trim();

    if (!userText) {
      return;
    }

    if (isTyping) {
      return;
    }
    

    const temporaryUserMessageId = `user-${Date.now()}`;

    setSelectedChatId(null);

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: temporaryUserMessageId,
        role: "user",
        text: userText,
        chatId: null,
        isWelcome: false,
      },
    ]);

    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/ai-chat`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
          message: userText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.reply || data.message || "AI response generate nahi ho saka.",
        );
      }

      const reply = data.reply || "AI response empty receive hua.";

      /*
       * Backend chat object return kare to uska ID milega.
       * Agar old backend response hai to history reload karke ID find hogi.
       */

      let savedChat = data.chat || null;

      if (!savedChat?.id) {
        const updatedHistory = await fetchHistory();

        savedChat =
          updatedHistory.find(
            (chat) => chat.question?.trim() === userText.trim(),
          ) || null;
      }

      const savedChatId = savedChat?.id || data.chat_id || null;

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: savedChatId ? `ai-${savedChatId}` : `ai-${Date.now()}`,
          role: "ai",
          text: reply,
          chatId: savedChatId,
          isWelcome: false,
        },
      ]);

      if (savedChatId) {
        setSelectedChatId(savedChatId);
      }

      await fetchHistory();
    } catch (error) {
      console.error("AI chat error:", error);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `error-${Date.now()}`,
          role: "ai",
          text:
            error.message || "Server error aaya hai. Please dobara try karein.",
          chatId: null,
          isWelcome: false,
          isError: true,
        },
      ]);

      toast.error(error.message || "AI response generate nahi ho saka.");
    } finally {
      setIsTyping(false);

      window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Keyboard submit
  |--------------------------------------------------------------------------
  */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
  setInput(e.target.value);

  e.target.style.height = "auto";
  e.target.style.height = e.target.scrollHeight + "px";
};

  /*
  |--------------------------------------------------------------------------
  | Suggestion click
  |--------------------------------------------------------------------------
  */

  const handleSuggestionClick = (prompt) => {
    setInput(prompt);

    window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  /*
  |--------------------------------------------------------------------------
  | Format history date
  |--------------------------------------------------------------------------
  */

  const formatHistoryDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Short history title
  |--------------------------------------------------------------------------
  */

  const getHistoryTitle = (question) => {
    const title = question?.trim() || "Untitled Chat";

    if (title.length <= 42) {
      return title;
    }

    return `${title.slice(0, 42)}...`;
  };

  /*
  |--------------------------------------------------------------------------
  | Mobile history drawer
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setHistoryOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (historyOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [historyOpen]);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <div className="dashboard-content">
          <div className="ai-box">
            <div className="ai-workspace">


  {/* Mobile history open button */}
  <button
    type="button"
    className="ai-history-menu-btn"
    onClick={() => setHistoryOpen(true)}
    aria-label="Open chat history"
    aria-controls="ai-history-sidebar"
    aria-expanded={historyOpen}
  >
    ☰
  </button>

  {/* Mobile overlay */}
  {historyOpen && (
    <div
      className="ai-history-overlay"
      onClick={() => setHistoryOpen(false)}
      role="button"
      tabIndex={0}
      aria-label="Close chat history"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setHistoryOpen(false);
        }
      }}
    />
  )}
              {/* History sidebar */}

              <aside
                id="ai-history-sidebar"
                className={`ai-history-sidebar ${historyOpen ? "open" : ""}`}
                aria-label="Chat history"
                aria-hidden={!historyOpen ? undefined : false}
              >
                <button
                  type="button"
                  className="ai-history-close-btn"
                  onClick={() => setHistoryOpen(false)}
                  aria-label="Close chat history"
                >
                  ×
                </button>

                <button
                  type="button"
                  className="new-chat-btn"
                  onClick={startNewChat}
                  disabled={isTyping}
                >
                  <FiMessageSquare />
                  New Chat
                </button>

                <div className="history-heading">
                  <h6>Recent Chats</h6>
                  <span>{history.length}</span>
                </div>
                <button
                  className="clear-history-btn"
                  onClick={clearAllHistory}
              >
                  <FiTrash2 />
                  Clear All
              </button>
                {historyLoading ? (
                  <div className="empty-history">
                    <FiRefreshCw className="history-loading-icon" />
                    <p>Loading chats...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="empty-history">
                    <FiMessageSquare />
                    <p>No chats yet</p>
                    <small>Apna pehla career question poochiye.</small>
                  </div>
                ) : (
                  <div className="history-list">
                    {history.map((chat) => (
                      <div
                        key={chat.id}
                        role="button"
                        tabIndex={0}
                        className={`history-item ${
                          selectedChatId === chat.id ? "active-history" : ""
                        }`}
                        onClick={() => openHistoryChat(chat)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openHistoryChat(chat);
                          }
                        }}
                      >


                        <span className="history-icon">
                          <FiMessageSquare />
                        </span>

                        <div className="history-text">
                          <p>{getHistoryTitle(chat.question)}</p>

                          <small>
                            <FiClock />
                            {formatHistoryDate(chat.created_at)}
                          </small>
                        </div>

                        <button
                          type="button"
                          className="history-delete-btn"
                          aria-label="Delete chat"
                          disabled={deletingChatId === chat.id}
                          onClick={(event) => deleteHistoryChat(event, chat.id)}
                        >
                          {deletingChatId === chat.id ? (
                            <span className="delete-loader">...</span>
                          ) : (
                            <FiTrash2 />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </aside>

              {/* Main chat section */}

              <section className="ai-chat-section">
                <div className="ai-top">
                  <div>
                    <h2>🤖 AI Career Coach</h2>

                    <p>Personalized guidance for your career journey</p>
                  </div>

                  <span className="ai-online-status">
                    <i></i>
                    Online
                  </span>
                </div>

                {/* Suggestions */}

                <div className="ai-suggestion-box">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      type="button"
                      key={suggestion.label}
                      disabled={isTyping}
                      onClick={() => handleSuggestionClick(suggestion.prompt)}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>

                {/* Messages */}

                <div className="ai-chat-area">
                  {messages.map((message, index) => {
                    const isAi = message.role === "ai";

                    const messageId = message.id || `${message.role}-${index}`;

                    const currentFeedback = message.chatId
                      ? feedbackState[message.chatId]
                      : null;

                    return (
                      <div
                        key={messageId}
                        className={`chat-row ${
                          message.role === "user" ? "user" : "ai"
                        }`}
                      >
                        <div className="chat-avatar">
                          {message.role === "user"
                            ? user?.name?.charAt(0)?.toUpperCase() || "U"
                            : "🤖"}
                        </div>

                        <div className="chat-content">
                          <div
                            className={`chat-bubble ${
                              message.isError ? "error-message" : ""
                            }`}
                          >
                            {isAi && (
                              <div className="assistant-top">
                                <strong>StudentAI Career Coach</strong>

                                {!message.isWelcome && (
                                  <button
                                    type="button"
                                    aria-label="Copy response"
                                    onClick={() =>
                                      copyText(message.text, messageId)
                                    }
                                  >
                                    {copiedMessageId === messageId ? (
                                      <span>Copied</span>
                                    ) : (
                                      <FiCopy />
                                    )}
                                  </button>
                                )}
                              </div>
                            )}

                           <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.text}
                            </ReactMarkdown>
                          </div>

                          {isAi && !message.isWelcome && (
                            <div className="chat-actions">
                              <button
                                type="button"
                                className={
                                  copiedMessageId === messageId
                                    ? "active-action"
                                    : ""
                                }
                                onClick={() =>
                                  copyText(message.text, messageId)
                                }
                              >
                                <FiCopy />

                                {copiedMessageId === messageId && <span></span>}
                              </button>

                              <button
                                type="button"
                                aria-label="Like response"
                                className={
                                  currentFeedback?.liked ? "active-action" : ""
                                }
                                disabled={!message.chatId}
                                onClick={() =>
                                  saveFeedback(message.chatId, "like")
                                }
                              >
                                <FiThumbsUp />
                              </button>

                              <button
                                type="button"
                                aria-label="Dislike response"
                                className={
                                  currentFeedback?.disliked
                                    ? "active-action"
                                    : ""
                                }
                                disabled={!message.chatId}
                                onClick={() =>
                                  saveFeedback(message.chatId, "dislike")
                                }
                              >
                                <FiThumbsDown />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing loader */}

                  {isTyping && (
                    <div className="chat-row ai">
                      <div className="chat-avatar">🤖</div>

                      <div className="chat-content">
                        <div className="chat-bubble typing">
                          <div className="assistant-top">
                            <strong>StudentAI Career Coach</strong>
                          </div>

                          <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef}></div>
                </div>

                {/* Input */}

                <div className="ai-input-area">
                  <textarea
                    ref={textareaRef}
                    rows="1"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={isTyping}
                    maxLength={2000}
                    placeholder="Ask anything about resume, jobs, interviews or career..."
                  />

                  <button
                    className="send-btn"
                    onClick={sendMessage}
                    disabled={isTyping || !input.trim()}
                  >
                    <FiSend />
                  </button>

                  <span className="input-counter">{input.length}/2000</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}