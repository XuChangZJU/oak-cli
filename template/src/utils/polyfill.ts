import { v4 } from 'uuid';

async function generateNewId() {
    return v4({ random: await getRandomValues(16) });
}

Object.assign(global, {
    generateNewId,
});
