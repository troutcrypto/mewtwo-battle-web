const CONTRACT_ADDRESS = '0x55253F2b495C4e7dfb758877c196Cbd0073788cA';

const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        attackDmg: characterData.attackDmg.toNumber(),
    };

};

export { CONTRACT_ADDRESS, transformCharacterData };