import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red, blue, white } from "@mui/material/colors";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Paper } from "@mui/material";
// import toast, {Toaster} from 'react-hot-toast';
// import { io } from 'socket.io-client';
// import { getCookie } from 'cookies-next';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import { useRouter } from 'next/navigation';
import KeyboardIcon from "@mui/icons-material/Keyboard";
import styles from "../styles/Chat.module.css";


// import EmojiPicker from 'emoji-picker-react';

// const darkTheme = createTheme({ palette: { mode: 'dark' } });
const model = "Athena";

// The messages shown to User while Athena Processes the Data
const USER_STATUSES = [
  " ",
  "loading ",
  "tokenizing ",
  "comprehending ",
  "fetching ",
  "decoding ",
];

export default function chat() {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState([
    [
      "Hi there! I am Shreyans. Shoot me questions 💭",
      "Athena",
      "txt",
    ],
  ]);
  const [isRecording, setIsRecording] = useState(false);
  //   const router = useRouter();
  const scrollContainerRef = useRef(null);

  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [textBox, setTextBox] = useState(false); //UI components to show and hide the text box area
  const [connection, setConnection] = useState(true);
  const [status, setStatus] = useState(0);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    window.scrollTo(0, 60)
  }, [])
  

  const sendMessage =  async (event) => {
    event.preventDefault();
    // if (message.includes('❤️')){ // easter egg
    //   toast('💖💖💖',
    //   {
    //     icon: '🦄'
    //   }
    // )
    // }
    if (message) {
        setMessage("");

    setIsTyping(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        [message, "Shreyans", "txt"],
      ]);
      const response = await fetch('/api/chat_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
  
      const result = await response.json();
        setIsTyping(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        [result['updatedData'], "Athena", "txt"],
      ]);
      // for (let index = 0; index < messages.length; index++) {
      //   if(messages[index][1] == 'Athena' && messages[index][0] == '...'){
      //     messages.splice(index,1)
      //     console.log(messages[index])
      //   }
      // }
      
      setStatus(0);
    }
  };

  const handleKeyDown = (event) => {
    //Press Enter to send
    if (event.key === "Enter") {
      sendMessage(event);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Head>
        <title> Chat | The MicroBits</title>
        <meta
          name="description"
          content="I am Shreyans Soni, a pre-final year student pursuing Electronics and Instrumentation from BITS Pilani, Hyderabad Campus. With having discovered special interest in creation, development and writing, I have been involved in AI and Web dev for more than two years. My other interests include tinkering with electronic components, making sounds using guitar and hitting a shuttle with racket. "
        />
        <link
          rel="icon"
          href="/assets/img/shreyans1.png"
          type="image/icon type"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Montserrat:wght@300;400;500;600;700&family=Nunito:wght@300;400&family=Source+Code+Pro:wght@300;400;700&family=Square+Peg&display=swap"
          rel="stylesheet"
        />
        <meta
          name="google-site-verification"
          content="zoIu_lrc5Gw-_uzNUiSMpRl088xH7AbdJoOKq7FDWlQ"
        />
        <link rel="preload" as="font" />
      </Head>
      <Navbar />
      <div
        style={{
          width: "100%",
          backgroundColor: "#d3d1d7",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"

        //   boxShadow: '1px 1px 80px 1px rgba(166, 124, 160 , 0.5)',
        }}
      >
        {/* <body style={{ backgroundColor: 'black' }}> */}
        {/* <Box sx={{ bgcolor: '#cfe8fc', height: '100vh', margin: 0, padding: 0}} /> */}
        <div className={styles.glowingBorder}> 
        <Card  sx={{ maxWidth: 550, margin: "auto auto" }} style={{ borderRadius: '16px', backgroundColor: '#171821' }}>
          <CardHeader style={{ borderBottom: '1px solid rgba(216,216,219, 0.1)' }} subheaderTypographyProps={{ color: '#e3e2e1', marginTop: '-1px', fontSize: '12px' }} titleTypographyProps={{ fontSize: '18px', fontFamily: 'inherit' }} sx={{  position: 'relative' , bgcolor: '#171723', color: 'white',  padding: '12px'}} elevation={12}
            avatar={
              <Avatar aria-label="profile">
                <img src="/assets/img/shreyans1.png" alt="profile" />
              </Avatar>
            }
            action={
              <IconButton aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            }
            title="Shreyans (bot)"
            subheader="online"
          />

          <CardContent
            ref={scrollContainerRef}
            style={{
              height: "450px",
              minWidth: "500px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflowY: "auto",
              scrollbarWidth: "none",
              scrollbarGutter: "stable",
              backgroundColor: "rgba(0,0,0,0)",
              scrollBehavior: "smooth",
            }}
          >
         {messages.map((item, index) => (
        <div key={index} style={{
          float: item[1] == model ? 'left': 'right',
          textAlign: item[1] == model ? 'left': 'right',
          marginRight: item[1] === model ? '12px' : '0px',
          marginLeft: item[1] === model ? '0px' : '12px',
          display: 'flex',
          justifyContent: item[1] === model ? 'flex-start' : 'flex-end',
          marginTop: '4px'
        }}>  
            <div style={{ maxWidth: '300px', padding: '2px' }}>
          {item[2] == 'txt' && (
            <Typography variant="subtitle" display="block" style={{ whiteSpace: 'pre-line',  backgroundColor :  item[1] == model ? '#343145': '#5745b4' }} sx={{ color: 'white', padding: '8px 10px', borderRadius: '10px', fontSize: '15px', textAlign: 'left', wordWrap: 'break-word', borderTopLeftRadius: item[1] == model ? '1px': '10px',  borderTopRightRadius: item[1] == model ? '10px': '1px' }}> {item[0]}</Typography>
          )}
            </div>
        </div>
         ))}
            {isTyping && ( 
        // typing animation + status 
             <div style={{ width: 'fit-content' , display: 'flex', flexDirection: 'row', backgroundColor :  '#343145' , color: 'white', padding: '6px 10px', borderRadius: '10px', fontSize: '15px', textAlign: 'left', borderTopLeftRadius: '1px'}}>
          {connection && (
            <>
              <div>{USER_STATUSES[status]}</div>
              <div className={styles.typing}> . . .</div>
            </>
          
          )}
          {!connection && (
            <div>Bot is Offline.</div>
          ) }
          </div>
        )} 
          </CardContent>
          <CardActions
            disableSpacing
            sx={{ justifyContent: "center" }}
            style={{ backgroundColor: "rgba(0, 0, 0, 0) !important" }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                margin: "auto",
                marginTop: "2px",
                marginBottom: "-1px",
              }}
            >
              <IconButton
                aria-label="keyboard"
                style={{ position: "absolute" }}
              >
                <KeyboardIcon
                  style={{
                    transition: "2s ease-in",
                    color: "#fff",
                    borderRadius: "10px",
                  }}
                />
              </IconButton>
              <textarea
                id="chat-box"
                label="Chat"
                style={{
                  height: "40px",
                  backgroundColor: "#343145",
                  borderRadius: "16px",
                  width: "100%",
                  color: "white",
                  padding: "8px 14px",
                  resize: "none",
                  fontSize: "16px",
                  font: "inherit",
                  scrollbarWidth: "none",
                  paddingLeft: "38px",
                  transition: "width 0.4s ease-in-out",
                }}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                value={message}
                onKeyDown={handleKeyDown}
              />

              {/* <IconButton
                aria-label="attach"
                style={{
                  cursor: "pointer",
                  position: "absolute",
                  zIndex: 1,
                  right: isRecording ? 3 : 0,
                  top: 0,
                }}
              >
                <input
                  type="file"
                  id="fileInput"
                  accept="audio/*"
                  style={{ display: "none" }}
                />
                <label htmlFor="fileInput">
                  <AttachFileIcon style={{ color: "#fff", fontSize: "23px" }} />
                </label>
              </IconButton> */}
            </div>

              <IconButton
                aria-label="send"
                style={{
                  color: "#fff",
                  backgroundColor: "#5745b4",
                  margin: "auto 5px",
                }}
                onClick={sendMessage}
              >
                <SendIcon  />
              </IconButton>
            {/* {!message && (
              <IconButton
                aria-label="mic"
                style={{
                  backgroundColor: isRecording ? "#ff4122" : "#4677ba",
                  color: isRecording ? "#000" : "#fff",
                  margin: "auto 5px",
                }}
              >
                <MicIcon
                  style={{
                    fontSize: isRecording ? "30px" : "25px",
                    transition: "fontSize 0.5s",
                    transitionProperty: "font-size",
                    transitionDuration: "0.5s",
                  }}
                />
              </IconButton>
            )} */}
          </CardActions>
        </Card>
        </div>
      </div>
      <Footer/> 
    </>
  );
}