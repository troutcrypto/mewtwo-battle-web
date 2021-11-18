import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';
import LoadingIndicator from '../LoadingIndicator';
// given this state thing as input
const Arena = ({ characterNFT, setCharacterNFT }) => {
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState('');
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const { ethereum } = window;
        // set the account stuff
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            );
            setGameContract(gameContract);
        } else {
            console.log("No Eth wallet found!");
        }
    }, []);

    useEffect(() => {
        const fetchBoss = async () => {
            console.log("Getting boss");
            const bossTxn = await gameContract.getBigBoss();
            console.log("Boss:", bossTxn);
            setBoss(transformCharacterData(bossTxn));
        };
        const onAttackComplete = (newBossHp, newPlayerHp) => {
            const bossHp = newBossHp.toNumber();
            const playerHp = newPlayerHp.toNumber();
            console.log("Attack complete Boss hp: ${bossHp}, player Hp: ${playerHp}");
            // update boss state
            setBoss((prevState) => {
                return { ...prevState, hp: bossHp };
            });

            // update char state
            setCharacterNFT((prevState) => {
                return { ...prevState, hp: playerHp };
            });
        }

        if (gameContract) {
            fetchBoss();
            gameContract.on("AttackComplete", onAttackComplete);
        } 

        return () => {
            if (gameContract) {
                gameContract.off("AttackComplete", onAttackComplete);
            }
        };
    }, [gameContract]);

    const runAttackAction = async () => {
        try {
            if (gameContract) {
                setAttackState('attacking');
                console.log('Attacking boss (runAttackAction)');
                const attackTxn = await gameContract.attackBoss();
                await attackTxn.wait();
                console.log("Attack txn:", attackTxn);
                setAttackState("attacked");

                // set toast state to true the false
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }

        } catch (error) {
            console.error("error attacking boss:", error);
            setAttackState('');
        }
    };

    return (
    <div className="arena-container">
        {/* Replace your Boss UI with this */}
        {boss && characterNFT && (
                <div id="toast" className={showToast ? 'show' : ''}>
                    <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
                </div>
        )}

        {boss && (
        <div className="boss-container">
            <div className={`boss-content`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
                <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
                <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                </div>
            </div>
            </div>
            <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
                {`💥 Attack ${boss.name}`}
            </button>
            </div>
            {attackState === 'attacking' && (
                <div className="loading-indicator">
                    <LoadingIndicator />
                    <p>Attacking ... </p>
                </div>
            )} 


        </div>
        )}

        {characterNFT && (
        <div className="players-container">
            <div className="player-container">
            <h2>Your Character</h2>
            <div className="player">
                <div className="image-content">
                <h2>{characterNFT.name}</h2>
                <img
                    src={characterNFT.imageURI}
                    alt={`Character ${characterNFT.name}`}
                />
                <div className="health-bar">
                    <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                    <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                </div>
                </div>
                <div className="stats">
                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDmg}`}</h4>
                </div>
            </div>
            </div>
        </div>
        )}
    </div>
    );
   
 ;
};


export default Arena;