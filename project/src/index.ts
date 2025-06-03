const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

// Inicialize o Firebase Admin SDK
admin.initializeApp();
// Função que envia e-mail quando uma avaliação é adicionada
exports.sendEmailOnNewReview = functions.firestore
    .document('avaliacoes/{reviewId}') // Quando um novo documento for adicionado à coleção 'avaliacoes'
    .onCreate((snap: { data: () => any; }, context: any) => {
        const newValue = snap.data(); // Obtenha os dados da nova avaliação
        const rating = newValue.rating;
        const userId = newValue.userId;
        
        // Obtenha o email do usuário (se você armazenou esse dado no Firestore, por exemplo)
        admin.firestore().collection('users').doc(userId).get()
            .then((userDoc: { data: () => { (): any; new(): any; email: any; displayName: string; }; }) => {
                const userEmail = userDoc.data().email;
                const userName = userDoc.data().displayName || 'Usuário';

                // Configuração do e-mail
                const msg = {
                    to: 'seuemail@dominio.com', // Seu e-mail ou o e-mail para onde você quer enviar
                    from: 'noreply@seusistema.com', // E-mail do remetente
                    subject: `Nova avaliação recebida de ${userName}`,
                    text: `O usuário ${userName} avaliou o sistema com a nota ${rating}.`,
                    html: `<p><strong>${userName}</strong> avaliou o sistema com a nota <strong>${rating}</strong>.</p>`
                };

                // Enviar o e-mail usando o SendGrid
                return sgMail.send(msg);
            })
            .then(() => {
                console.log('E-mail enviado com sucesso!');
            })
            .catch((error: any) => {
                console.error('Erro ao enviar e-mail:', error);
            });
    });
