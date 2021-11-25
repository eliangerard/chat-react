import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyCWi5bF7kQVf3J4J2nrJ_oT-jjiDlwcDUs",
  authDomain: "chat-workshop-tecgang.firebaseapp.com",
  projectId: "chat-workshop-tecgang",
  storageBucket: "chat-workshop-tecgang.appspot.com",
  messagingSenderId: "1016795359793",
  appId: "1:1016795359793:web:6911ef4a5b75bfa4210310"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Chat increíble</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div class="centrador">
      <button class="logIn" onClick={signInWithGoogle}>Iniciar sesión con Google</button>
    </div>
  )

}
function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Cerrar sesión</button>
  )
}
function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limitToLast(1024);

  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL, displayName } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

  }
  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>
    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="..." />

      <button class="sender" type="submit" disabled={!formValue}>Enviar</button>

    </form>
  </>)
}
function ChatMessage(props) {
  const { text, uid, photoURL} = props.message;
  const {displayName } = auth.currentUser;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>    
    <h4 className={`name ${messageClass}`}>{displayName}</h4>
    <div className={`message ${messageClass}`}>      
      <img src={photoURL} />      
      <p>{text}</p>
    </div>
  </>)
}

export default App;