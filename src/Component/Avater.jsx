import React, { useEffect, useRef, useState } from 'react'
import avatorImage from "../Images/gk_image.png"
import { FiSend } from "react-icons/fi";
import { IoMicOutline } from "react-icons/io5";
import axios from 'axios';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskMode,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";

const Avater = () => {
  const [accessToken, setAccessToken] = useState('')
  const [initialModal, setInitialModal] = useState(true)
  const [accessTokenLoading, setAccessTokenLoading] = useState(false)
  const avatar = useRef(null);
  const mediaStream = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(true)
  const [isUserTalking, setIsUserTalking] = useState(false)
  const [isAvatarTalking, setIsAvatarTalking] = useState(false)
  const [interactionCount, setInteractionCount] = useState(0)
  const [messages, setMessages] = useState([
    { text: "what is your name", sender: "user" },
    { text: "my name is sajal ghosh", sender: "ai" },
  ])
  const [currentAiMessage, setCurrentAiMessage] = useState('')
  const [currentUserMessage, setCurrentUserMessage] = useState('')
  const currentUserMessageRef = useRef('')
  const currentAiMessageRef = useRef('')
  const [stream, setStream] = useState(null)
  const [data, setData] = useState(null)
  const [knowledgeId, setKnowledgeId] = useState('202aadc9c93a41d1a282d1ec1c16e950')
  const [language, setLanguage] = useState('en')
  const [chatMode, setChatMode] = useState('text_mode')
  const [debug, setDebug] = useState('')
  const messagesEndRef = useRef(null)
  const [timeElapsedKeypress, setTimeElapsedKeypress] = useState(0);
  const [textInteractionCount, setTextInteractionCount] = useState(0);
  const [text, setText] = useState("");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [firstRender, setFirstRender] = useState(false);



  // this code for getting access token from the server
  const handleAccessToken = async () => {
    setAccessTokenLoading(true)
    try {
      const { data } = await axios.get("https://api.aiwellness.ai/api/v1/get_access_token/ABY2VmODFhZmVjYWRkNGMwZDliOWEyMWVmMDE4YWVmM2MtMTc0Mzg3MTA0NQ==")
      if (data?.success) {
        setAccessToken(data?.data?.token)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setAccessTokenLoading(false)
    }
  }

  // this code for handle access token and start session
  useEffect(() => {
    handleAccessToken();

    return () => {
      // console.log("calll.. sajal")
      if (firstRender) {
        (async () => {

          await endSession();
        })();
        console.log("data", data)
      }
      setFirstRender(true)
    }
  }, [])

  async function endSession() {
    
    try {
      const res = await avatar.current?.stopAvatar();
 
    } catch (error) {
      console.log("error", error

      )
    }
    avatar.current = null;
    mediaStream.current = null;
    setStream(undefined);
    setIsAvatarTalking(false);
    setIsUserTalking(false);
    localStorage.setItem("isAvatarTalking", false);
    setData(null);

  }

  async function startSession() {
    setIsLoadingSession(true);
    setInitialModal(false)

    avatar.current = new StreamingAvatar({
      token: accessToken,
      basePath: process.env.REACT_APP_BASE_URL,
    });

    avatar.current?.on(StreamingEvents.USER_START, (event) => {
      setIsVoiceMode(true);
      setIsUserTalking(true);
      setInteractionCount(interactionCount + 1);
    });

    avatar.current?.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
      // console.log(">>>>> User started talking:", event?.detail?.message);
      if (event?.detail?.message) {
        setMessages((prev) => [
          ...prev,
          { text: event?.detail?.message, sender: "user" },
        ]);
        currentUserMessageRef.current = "";
      }
    });

    avatar.current?.on(StreamingEvents.USER_STOP, (event) => {
      setIsVoiceMode(false);
      setIsUserTalking(false);
      // console.log("USER-STOPPED-TALKING");

      if (currentUserMessageRef.current) {
        setMessages((prev) => [
          ...prev,
          { text: currentUserMessageRef.current, sender: "user" },
        ]);
        currentUserMessageRef.current = "";
      }
    });

    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      setIsAvatarTalking(true);
    });

    avatar.current.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (e) => {
      if (e.detail?.message) {
        const newMessage = currentAiMessageRef.current
          ? `${currentAiMessageRef.current} ${e.detail.message}`
          : e.detail.message;

        currentAiMessageRef.current = newMessage;

        setMessages((prev) => {
          const updatedMessages = [...prev];
          if (
            updatedMessages.length > 0 &&
            updatedMessages[updatedMessages.length - 1].sender === "ai"
          ) {
            updatedMessages[updatedMessages.length - 1].text = newMessage;
          } else {
            updatedMessages.push({ text: newMessage, sender: "ai" });
          }
          return updatedMessages;
        });

        setCurrentAiMessage(newMessage);
      }
    });

    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      // console.log("Avatar stopped talking", e);
      setIsAvatarTalking(false);
      currentAiMessageRef.current = ""
    });

    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, async () => {
      // console.log("Stream disconnected");
      await endSession();
    });

    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      setStream(event.detail);
    });

    try {
      const res = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: "5f062eb00a3d4ed2aaba9078965d8b68",
        knowledgeId: knowledgeId,
        voice: {
          rate: 1.5,
          emotion: VoiceEmotion.EXCITED,
        },
        language: language,
        disableIdleTimeout: true,
      });
      setData(res);
      // console.log("res", res)
      setMessages((prev) => [
        ...prev,
        { text: "How can I help you?", sender: "ai" },
      ]);
      await avatar.current?.startVoiceChat({
        useSilencePrompt: false,
      });
      setChatMode("voice_mode");
    } catch (error) {
      console.error("Error starting avatar session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  }

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current?.play();
        setDebug("Playing");
      };
    }
  }, [mediaStream, stream]);

  const handlePlayVideo = () => {
    if (mediaStream.current) {
      mediaStream.current
        .play()
        .then(() => {
          setDebug("Playing");
          setIsVideoPlaying(true);
        })
        .catch((error) => {
          console.error("Error playing video:", error);
          setDebug("Error playing video");
        });
    }
  };

  // this code for handle user input
  const handleInputChange = (e) => {
    setText(e.target.value); // Updates the text state with input value
    setTimeout(() => {
      handleChangeChatMode("text_mode"); // Switches to text mode after 1 second
    }, 1000);
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isAvatarTalking) {
      handleSpeak(); // Triggers the speak function
    }
  };

  // Handles sending the text input to the avatar
  async function handleSpeak() {
    // console.log("calll....")
    setIsLoadingRepeat(true); // Shows loading state
    if (!avatar.current) {
      setDebug("Avatar API not initialized");
      return;
    }

    await avatar.current
      .speak({
        text: text, // Uses the text state value
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC
      })
      .catch((e) => {
        setDebug(e.message); // Error handling
      });

    setTextInteractionCount(textInteractionCount + 1); // Tracks interactions
    setIsLoadingRepeat(false); // Hides loading state
    setText("");
  }

  // Handles switching between text and voice modes
  const handleChangeChatMode = async (mode) => {
    if (mode === chatMode) return; // No change if same mode

    if (mode === "text_mode") {
      avatar.current?.closeVoiceChat(); // Closes voice chat
      setIsVoiceMode(false);
    } else {
      await avatar.current?.startVoiceChat(); // Starts voice chat
    }
    setChatMode(mode); // Updates the mode state
  };



  // this code for handle timeout of not use the avator
  useEffect(() => {
    if (interactionCount) {
      let timer;
      if (!isAvatarTalking && !isUserTalking) {
        timer = setInterval(() => {
          setTimeElapsed(prevTime => prevTime + 1);
        }, 1000)

        return () => clearInterval(timer);
      }

      setTimeElapsed(0)
    }
  }, [isAvatarTalking, isUserTalking])

  useEffect(() => {
    if (timeElapsed >= 180) {
      (async () => {

        await endSession();
      })()
      window.location.reload()
    }
  }, [timeElapsed])

  useEffect(() => {
    if (textInteractionCount) {
      let timer;
      if (!isAvatarTalking && !text) {
        timer = setInterval(() => {
          setTimeElapsedKeypress(prevTime => prevTime + 1);
        }, 1000)

        return () => clearInterval(timer);
      }

      setTimeElapsedKeypress(0)
    }
  }, [isAvatarTalking, text])

  useEffect(() => {
    if (timeElapsedKeypress >= 180) {
      (async () => {

        await endSession();
      })();
      window.location.reload()
    }
  }, [timeElapsedKeypress])


  function processTextWithUrls(text) {
    // Match either:
    // 1. Markdown-style links [text](url)
    // 2. Plain URLs (http/https or domain with TLD)
    const urlRegex = /(\[(.*?)\]\((.*?)\))|(https?:\/\/[^\s]*|(?:www\.)?[a-zA-Z0-9-]+\s*\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2})?[^\s]*)/gi;

    return text.replace(urlRegex, function (match, ...groups) {
      // Handle markdown-style links [text](url)
      if (groups[0]) { // Markdown link detected
        const displayText = groups[1] || '';
        let url = groups[2] || '';

        // Clean URL and ensure proper protocol
        url = url.replace(/\s+/g, '');
        if (!url.startsWith('http')) {
          url = 'https://' + url;
        }

        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${url}</a>`;
      }

      // Handle plain URLs
      let cleanedUrl = match.replace(/\s+/g, '');

      // Add protocol if missing
      if (!cleanedUrl.startsWith('http')) {
        cleanedUrl = 'https://' + cleanedUrl;
      }

      // Fix any protocol duplication
      cleanedUrl = cleanedUrl
        .replace(/^http(s?):\/\/http(s?):\/\//, 'http$1://')
        .replace(/^https:\/\/https:\/\//, 'https://');

      return `<a href="${cleanedUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">${cleanedUrl}</a>`;
    });
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      {initialModal &&<>
          <div className='fixed inset-0 bg-black bg-opacity-100 flex items-center justify-center z-50 h-[100vh]'>
            <div class="flex justify-center items-center min-h-screen bg-black">
              <div class="bg-gradient-to-b from-[#0f1a17] to-[#063c2e] rounded-[32px] shadow-lg max-w-xs w-full flex flex-col items-center">

                <div className='border-[#046C59] border-[0.5px] mb-4 bg-gradient-to-b from-[#2c2c2c] to-[#003d2e] rounded-[32px]'>

                  <img
                    src={avatorImage}
                    alt="Chat Person"
                    class="rounded-[24px] w-full object-cover"
                  />
                </div>

                <button
                  onClick={async () => {
                    await startSession();
                    handlePlayVideo();
                    setInitialModal(false)

                  }}
                  disabled={accessTokenLoading}
                  class="mt-6 mb-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-full transition-colors w-full max-w-[200px]">
                  {accessTokenLoading && <svg aria-hidden="true" role="status" className="inline w-6 h-6 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path strokeWidth="2" d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                    <path strokeWidth="2" d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                  </svg>}
                  Chat Now
                </button>
              </div>
            </div>


          </div>
        </>
      }

      {
        isLoadingSession && (
          <div className="absolute top-0 left-0 w-full h-full bg-black z-10 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-emerald-600 ml-2">Loading...</span>
          </div>

        )
      }
      <div className="min-h-screen flex md:items-center justify-center bg-black p-2 md:p-6">
        <div className="flex flex-col md:flex-row overflow-hidden max-w-4xl w-full gap-1 md:gap-5">
          {/* Left side: Image */}
          <div className="md:w-1/3 flex justify-center items-center mt-[6.5vh] md:mt-0 md:p-6 bg-[#005443] rounded-2xl md:rounded-3xl">
            <video
              ref={mediaStream}
              autoPlay
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "20px",
                // marginTop: "2rem"
              }}
            >
              <track kind="captions" />
            </video>
          </div>

          {/* Right side: Chatbot Info */}
          <div className="md:w-2/3 flex flex-col justify-between gap-1 md:gap-3">
            <div className='bg-[#005443] rounded-2xl p-3 pt-2 pb-0 md:p-6 shadow-lg min-h-[59vh] md:min-h-[60vh]'>
              {/* <h2 className="text-2xl font-semibold mb-4 text-center">
                Meet <span className="text-orange-500">{'{Ai Chatbot Name}'}</span>,
                <br /> your very own AI concierge, <br /> ready to assist
              </h2>

              <div className="grid grid-cols-1 gap-3 mt-6">
                <button className="bg-gray-100 hover:bg-gray-200 rounded-lg py-2 px-4 text-gray-700 text-left">
                  Help me plan my Sonoma itinerary
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 rounded-lg py-2 px-4 text-gray-700 text-left">
                  How can I explore Sonoma like a local
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 rounded-lg py-2 px-4 text-gray-700 text-left">
                  Find restaurants or Insider Pass deals
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 rounded-lg py-2 px-4 text-gray-700 text-left">
                  Tell me about spas or outdoor spots
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 rounded-lg py-2 px-4 text-gray-700 text-left">
                  Show me wine tastings events
                </button>

                <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-gray-700">Continue on phone: Scan QR</span>
                  <img
                    src="/your-qr-code-path.png"
                    alt="QR Code"
                    className="h-16 w-16"
                  />
                </div>
              </div> */}
              <div className="flex-1 overflow-y-auto p-4 h-[55vh] bg-gradient-to-b from-[#005443] to-[#005443] rounded-2xl shadow-lg">
                {messages.map((message, index) => (
                  <>
                    {message?.text && (
                      <div
                        key={index}
                        className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"
                          }`}
                      >
                        <div>
   {message.sender === "ai" && (<div className='text-white mb-2'>Dr. Gideon Kwok</div>)}
                        <div
                          className={`rounded-lg p-4 max-w-md ${message.sender === "user"
                            ? "bg-gradient-to-b from-[#018969] to-[#005642] text-white"
                            : "bg-[#000000C4] text-white shadow-lg border border-[#005A4966] border-[#018969] shadow-[0_0_6px_#00ffc3]"
                            }`}
                           
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: processTextWithUrls(message.text),
                            }}
                            className="text-[0.8rem] md:text-sm leading-relaxed"
                          ></div>
                        </div>
                        </div>
                      </div>
                    )}
                  </>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-3 flex items-center
             justify-between bg-[#005443] m-2 md:m-0 
             rounded-2xl fixed bottom-0 left-0 w-[96vw] md:w-full md:relative md:w-auto">
              <input
                type="text"
                placeholder="Ask me anything..."
                disabled={isAvatarTalking}
                className="flex-1 bg-[#018969] text-white placeholder-gray-200 text-[1.2rem] border border-gray-300 rounded-[50px] py-2 px-4 mr-2 focus:outline-none"
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                value={text}

              />
              <button className="text-blue-500 text-2xl mr-3 h-10 w-10 bg-[#018969] rounded-full p-2 flex items-center justify-center"
                disabled={isAvatarTalking} onClick={() => handleSpeak()}
              >
                <FiSend size={30} color={"white"} />
              </button>
              {<button className={`text-blue-500 text-2xl  mr-3 h-10 w-10 bg-[#018969] rounded-full p-2 flex items-center justify-center`}
                onClick={() => {
                  handleChangeChatMode(chatMode === "text_mode" ? "voice_mode" : "text_mode");
                  setIsVoiceMode(!isVoiceMode);
                }}
              >
                <IoMicOutline size={30} color={isVoiceMode ? "red" : "currentColor"} />
              </button>}
              {/* <div class="flex items-end gap-1 h-24">
                <div class="w-2 bg-blue-500 animate-pulse h-6"></div>
                <div class="w-2 bg-blue-500 animate-ping h-12"></div>
                <div class="w-2 bg-blue-500 animate-bounce h-20"></div>
                <div class="w-2 bg-blue-500 animate-ping h-10"></div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Avater