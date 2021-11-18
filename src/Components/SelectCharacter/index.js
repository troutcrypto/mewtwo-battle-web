import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';

import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import LoadingIndicator from '../LoadingIndicator';

const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    const [mintingCharacter, setMintingCharacter] = useState(false);

    // set the gameContract so we can use it immeidately
    useEffect(() => {
        const { ethereum } = window;
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer 
            );
            setGameContract(gameContract);
        } else {
            // no metamask wallet
            console.log("No ethereum wallet found");
        }
         
    }, []);

    // grab all characters
    useEffect(() => {
        const getCharacters = async () => {
            try {
                console.log("Getting contract characters to mint");

                const charactersTxn = await gameContract.getAllDefaultCharacters();
                console.log("charactersTxn:", charactersTxn);

                const characters = charactersTxn.map((characterData) => 
                    transformCharacterData(characterData) 
                );

                // save state
                setCharacters(characters); 
            } catch (error) {
                console.error("Something went wrong fetching characters:", error);
            }
        };
        // end of getCharrs function, still in useEffect closure

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(
                `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
            );
            // on mint -> log,

            // after minting, we can get the metadata of our contract
            if (gameContract) {
                const characterNFT = await gameContract.checkIfUserHasNFT();
                console.log("CharacterNFT: ", characterNFT);
                setCharacterNFT(transformCharacterData(characterNFT));
                alert("Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}"); 
            }
        };
        // end of onCharacterMint

        if (gameContract) {
            getCharacters();
            // setup NFT minted listener
            gameContract.on("CharacterNFTMinted", onCharacterMint);
        }

        return () => {
            if (gameContract) {
                // turn off the listener
                gameContract.off("CharacterNFTMinted", onCharacterMint);
            }
        };

    }, [gameContract]);
    // end use effect for gettng chars

    // function to do the minting
    const mintCharacterNFTAction = (characterId) => async () => {
        try {
            if (gameContract) {
                setMintingCharacter(true);
                console.log("Minting character in progress ...");
                const mintTxn = await gameContract.mintCharacterNFT(characterId);
                await mintTxn.wait();
                console.log("mintTxn:',mintTxn");
                setMintingCharacter(false);
            }
        } catch (error) {
            console.warn("MintCharacterAction Error:", error);
            setMintingCharacter(false);
        }
    };
    // end mint function

    /// render characters
    const renderCharacters = () =>
        characters.map((character, index) => (
            <div className="character-item" key={character.name}>      
                <div className="name-container">
                    <p>{character.name}</p>
                </div>
                <img src={character.imageURI} alt={character.name} />
                <button 
                    type="button"
                    className="character-mint-button"
                    onClick={mintCharacterNFTAction(index)}
                >{`Mint ${character.name}`}</button>
            </div> 
    ));

    

    return (
        <div className="select-character-container">
        <h2>Mint Your Hero. Choose wisely.</h2>
        {characters.length > 0 && (
            <div className="character-grid">{renderCharacters()}</div>
        )}
        {mintingCharacter && (
            <div className="loading">
                <div className="indicator">
                    <LoadingIndicator />
                    <p>Minting in progress...</p>
                </div>
                <img
                    src="https://i.gifer.com/origin/88/881ac203c6afe639f8a1332cf2490e99_w200.webp"
                    alt="Minting loading indicator"
                /> 
            </div>
        )}
        </div>
    );

;
};

export default SelectCharacter;