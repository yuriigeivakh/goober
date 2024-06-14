import Pusher from 'pusher';

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_ID, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
});

export default pusher;
