import { useEffect, useState } from "preact/hooks";
import { Game } from "../components/Game.tsx";
import { loadGame, updateGame, deleteGame } from "../components/games/store.ts";
import Header from "./Header.tsx";

interface SavedGame {
    id: string;
    name: string;
    code: string;
    timestamp: string;
    totalPoints: number;
}

export default function GameDetail({ id }) {
    const [game, setGame] = useState<SavedGame>({ code: '', id: '', timestamp: '', totalPoints: 0, name: '' });
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(game?.name || '');
    const [isEditingCode, setIsEditingCode] = useState(false);
    const [editedCode, setEditedCode] = useState(game?.code || '');

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const loadedGame = await loadGame(id);
                if (loadedGame) {
                    setGame(loadedGame);
                    setEditedName(loadedGame.name || '');
                    setEditedCode(loadedGame.code || '');
                }
            } catch (error) {
                console.error('Error fetching game:', error);
            }
        };
        fetchGame();
    }, [id]);

    if (!game) {
        return (
            <div class="container mx-auto px-4 py-8">
                <div class="text-center">
                    <h1 class="text-3xl font-bold mb-4">Game Not Found</h1>
                    <p class="text-gray-600">The game you're looking for doesn't exist or has been removed.</p>
                    <a href="/saved-games" class="text-blue-600 hover:text-blue-700 mt-4 inline-block">Back to Saved Games</a>
                </div>
            </div>
        );
    }

    const saveGame = async () => {
        if (!editedName.trim()) {
            alert('Game name cannot be empty');
            return;
        }
        try {
            const updatedGame = await updateGame(game.id, game.code, editedName);
            if (updatedGame) {
                setGame(updatedGame);
                setIsEditingName(false);
            }
        } catch (error) {
            console.error('Error updating game name:', error);
            alert('Failed to update game name');
        }
    };

    const handleCodeSave = async () => {
        try {
            const updatedGame = await updateGame(game.id, editedCode);
            if (updatedGame) {
                setGame(updatedGame);
                setIsEditingCode(false);
            }
        } catch (error) {
            console.error('Error updating game code:', error);
            alert('Failed to update game code');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
            return;
        }
        try {
            const success = await deleteGame(game.id);
            if (success) {
                window.location.href = '/saved-games';
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            alert('Failed to delete game');
        }
    };

    return (
        <>
            <Header lang={"de"}/>
            <div class="container max-w-3xl mx-auto px-4 py-8">
                <div class="mb-6 flex justify-between items-center">
                    <div>
                        {isEditingName ? (
                            <div class="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName((e.target as HTMLInputElement).value)}
                                    class="text-3xl font-bold mb-2 px-2 py-1 border rounded"
                                    autoFocus
                                />
                                <button
                                    onClick={saveGame}
                                    class="text-green-600 hover:text-green-700"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setEditedName(game.name);
                                        setIsEditingName(false);
                                    }}
                                    class="text-gray-600 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <h1 class="text-3xl font-bold mb-2 flex items-center gap-2">
                                {game.name}
                                <button
                                    onClick={() => {
                                        setEditedName(game.name);
                                        setIsEditingName(true);
                                    }}
                                    class="text-gray-400 hover:text-gray-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </button>
                            </h1>
                        )}
                        <p class="text-gray-600">Created: {new Date(game.timestamp).toLocaleString()}</p>
                        <p class="text-green-600 font-medium">Total Points: {game.totalPoints}</p>
                    </div>
                    <div class="flex gap-4">
                        <button
                            onClick={handleDelete}
                            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Delete Game
                        </button>
                        <a
                            href="/saved-games"
                            class="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
                        >
                            Back to List
                        </a>
                    </div>
                </div>
                <div class="border rounded-lg p-6 bg-white shadow-sm">
                    <div class="mb-4 flex justify-end">
                        <button
                            onClick={() => {
                                if (isEditingCode) {
                                    handleCodeSave();
                                } else {
                                    setEditedCode(game.code);
                                    setIsEditingCode(true);
                                }
                            }}
                            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {isEditingCode ? 'Save Code' : 'Edit Code'}
                        </button>
                    </div>
                    {isEditingCode ? (
                        <textarea
                            value={editedCode}
                            onChange={(e) => setEditedCode((e.target as HTMLTextAreaElement).value)}
                            class="w-full h-[400px] font-mono text-sm p-4 border rounded"
                        />
                    ) : (
                        <Game gameUrl={game} />
                    )}
                </div>
            </div>
        </>
    );
}