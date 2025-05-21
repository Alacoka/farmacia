import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./src/firebase"; // Ajuste o caminho conforme sua configuração

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const migrateUsers = async () => {
    const usersRef = collection(db, 'user'); // Verifique se a coleção "user" ainda está disponível
    const querySnapshot = await getDocs(usersRef);

    querySnapshot.forEach(async (docSnapshot) => {
        const data = docSnapshot.data();
        // Agora, salva na nova coleção "users"
        await setDoc(doc(db, 'users', docSnapshot.id), data);
    });
};

migrateUsers().catch(console.error);
