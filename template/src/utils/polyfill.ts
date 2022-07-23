import { v4, v1 } from 'uuid';

export type GenerateIdOption = {
    shuffle?: boolean;
};

async function generateNewId(option?: GenerateIdOption) {
    if (option?.shuffle && process.env.NODE_ENV === 'development') {
        return v4({ random: await getRandomValues(16) });
    }
    return v1({ random: await getRandomValues(16) });
}

Object.assign(global, {
    generateNewId,
});
