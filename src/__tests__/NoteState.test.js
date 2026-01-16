import React, { useContext } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import NoteState from '../context/notes/NoteState';
import NoteContext from '../context/notes/noteContext';

// Mock fetch globally
global.fetch = jest.fn();

// Test component that consumes the context
const TestConsumer = () => {
    const { notes, getNotes, addNote, deleteNote, editNote } = useContext(NoteContext);

    return (
        <div>
            <div data-testid="notes-count">{notes.length}</div>
            <div data-testid="notes-data">{JSON.stringify(notes)}</div>
            <button onClick={getNotes} data-testid="get-notes">Get Notes</button>
            <button onClick={() => addNote('Test', 'Description', 'tag')} data-testid="add-note">Add Note</button>
            <button onClick={() => deleteNote('123')} data-testid="delete-note">Delete Note</button>
            <button onClick={() => editNote('123', 'Updated', 'New Desc', 'new-tag')} data-testid="edit-note">Edit Note</button>
        </div>
    );
};

const renderWithProvider = () => {
    return render(
        <NoteState>
            <TestConsumer />
        </NoteState>
    );
};

describe('NoteState Context', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('token', 'test-token');
    });

    it('provides initial empty notes array', () => {
        renderWithProvider();

        expect(screen.getByTestId('notes-count').textContent).toBe('0');
    });

    it('fetches notes from API when getNotes is called', async () => {
        const mockNotes = [
            { _id: '1', title: 'Note 1', description: 'Desc 1', tag: 'tag1' },
            { _id: '2', title: 'Note 2', description: 'Desc 2', tag: 'tag2' },
        ];

        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockNotes),
        });

        renderWithProvider();

        await act(async () => {
            screen.getByTestId('get-notes').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('notes-count').textContent).toBe('2');
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/notes/fetchallnotes'),
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    'auth-token': 'test-token',
                }),
            })
        );
    });

    it('adds note when addNote is called', async () => {
        const newNote = { _id: 'new123', title: 'Test', description: 'Description', tag: 'tag' };

        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(newNote),
        });

        renderWithProvider();

        await act(async () => {
            screen.getByTestId('add-note').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('notes-count').textContent).toBe('1');
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/notes/addnote'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    'auth-token': 'test-token',
                }),
            })
        );
    });

    it('deletes note when deleteNote is called', async () => {
        const mockNotes = [
            { _id: '123', title: 'Note to Delete', description: 'Desc', tag: 'tag' },
            { _id: '456', title: 'Keep This', description: 'Desc', tag: 'tag' },
        ];

        // First, fetch notes
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockNotes),
        });

        renderWithProvider();

        await act(async () => {
            screen.getByTestId('get-notes').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('notes-count').textContent).toBe('2');
        });

        // Then delete one
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ success: true }),
        });

        await act(async () => {
            screen.getByTestId('delete-note').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('notes-count').textContent).toBe('1');
        });
    });

    it('sends auth token with requests', async () => {
        const mockNotes = [];
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockNotes),
        });

        renderWithProvider();

        await act(async () => {
            screen.getByTestId('get-notes').click();
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'auth-token': 'test-token',
                }),
            })
        );
    });

    it('uses environment API URL or defaults to localhost', async () => {
        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve([]),
        });

        renderWithProvider();

        await act(async () => {
            screen.getByTestId('get-notes').click();
        });

        // Should use localhost:5000 as default
        expect(fetch).toHaveBeenCalledWith(
            expect.stringMatching(/localhost:5000|REACT_APP_API_URL/),
            expect.any(Object)
        );
    });
});

describe('NoteState Edge Cases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('token', 'test-token');
    });

    it('handles empty token gracefully', async () => {
        localStorage.removeItem('token');

        fetch.mockResolvedValueOnce({
            json: () => Promise.resolve([]),
        });

        renderWithProvider();

        await act(async () => {
            screen.getByTestId('get-notes').click();
        });

        // Should still call fetch even without token
        expect(fetch).toHaveBeenCalled();
    });

    it('provides context to children', () => {
        renderWithProvider();

        // Component should be rendered with context
        expect(screen.getByTestId('notes-count')).toBeInTheDocument();
        expect(screen.getByTestId('get-notes')).toBeInTheDocument();
        expect(screen.getByTestId('add-note')).toBeInTheDocument();
        expect(screen.getByTestId('delete-note')).toBeInTheDocument();
        expect(screen.getByTestId('edit-note')).toBeInTheDocument();
    });
});
