
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import("https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js").then(
    (firebase) => {
        const firebaseConfig = {
            apiKey: "AIzaSyBmNN3Zt0jfel1UTzb5pF-df0QLBCGjm9M",
            authDomain: "synchro-42865.firebaseapp.com",
            projectId: "synchro-42865",
            storageBucket: "synchro-42865.appspot.com",
            messagingSenderId: "115204736345",
            appId: "1:115204736345:web:bfaaf98c0003872dc53848",
            measurementId: "G-76WWP2JG74"
        };
        const app = firebase.initializeApp(firebaseConfig);

        import("https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js").then(
            (module) => {
                chrome.runtime.onMessage.addListener((msg, sender, response) => {
                    console.log("firebase.js: " + msg);
                    if(msg.command == 'AddInteraction'){
                        try{
                            const db = module.getDatabase();
                            const InteractionsCount = module.ref(db, 'Interactions');

                            module.get(InteractionsCount).then((snapshot) => {
                                var data = parseInt(snapshot.val());
                                data += 1;
                                module.set(module.ref(db), {
                                    'Interactions': data
                                });
                            }).catch((error) => {
                                console.log("firebase.js: " + error);
                            });

                            const UserCount = module.ref(db, 'users/');

                            module.get(UserCount).then((snapshot) => {
                                allUsercounts = snapshot.val();

                                var beginningUserObj = msg.data;
                                allUsercounts[msg.nodeName] = beginningUserObj;
                                module.set(module.ref(db, 'users/'),allUsercounts);
                            });
                        }catch(e){
                            console.log("firebase.js: " + e);
                        }
                    }
                });
            }
        )
    }
)
