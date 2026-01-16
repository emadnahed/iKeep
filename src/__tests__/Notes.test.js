import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Notes from '../components/Notes';
import NoteContext from '../context/notes/noteContext';

const mockGetNotes = jest.fn();
const mockEditNote = jest.fn();
const mockDeleteNote = jest.fn();
const mockShowAlert = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const sampleNotes = [
    { _id: '1', title: 'Note 1', description: 'Description 1', tag: 'tag1', date: new Date().toISOString() },
    { _id: '2', title: 'Note 2', description: 'Description 2', tag: 'tag2', date: new Date().toISOString() },
];

const createMockContext = (notes = sampleNotes) => ({
    notes,
    getNotes: mockGetNotes,
    editNote: mockEditNote,
    deleteNote: mockDeleteNote,
    addNote: jest.fn(),
});

const renderNotes = (notes = sampleNotes) => {
    return render(
        <BrowserRouter>
            <NoteContext.Provider value={createMockContext(notes)}>
                <Notes showAlert={mockShowAlert} />
            </NoteContext.Provider>
        </BrowserRouter>
    );
};

describe('Notes Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('token', 'test-token');
    });

    it('redirects to welcome page if not authenticated', () => {
        localStorage.removeItem('token');
        renderNotes();

        expect(mockNavigate).toHaveBeenCalledWith('/welcome');
    });

    it('calls getNotes on mount when authenticated', () => {
        renderNotes();

        expect(mockGetNotes).toHaveBeenCalled();
    });

    it('renders notes heading', () => {
        renderNotes();

        expect(screen.getByText('You Notes')).toBeInTheDocument();
    });

    it('renders AddNote component', () => {
        renderNotes();

        expect(screen.getByText('Add a Note')).toBeInTheDocument();
    });

    it('renders all notes', () => {
        renderNotes();

        expect(screen.getByText('Note 1')).toBeInTheDocument();
        expect(screen.getByText('Note 2')).toBeInTheDocument();
    });

    it('shows message when no notes exist', () => {
        renderNotes([]);

        expect(screen.getByText('No notes to display')).toBeInTheDocument();
    });

    it('renders edit modal structure', () => {
        renderNotes();

        expect(screen.getByText('Edit Note')).toBeInTheDocument();
    });

    it('has modal form labels', () => {
        renderNotes();

        // Modal labels are present in the DOM
        expect(screen.getAllByLabelText(/title/i).length).toBeGreaterThan(0);
        expect(screen.getAllByLabelText(/description/i).length).toBeGreaterThan(0);
    });
});

describe('Notes Component - Edit Modal Elements', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('token', 'test-token');
    });

    it('has edit title input in modal', () => {
        renderNotes();

        const etitleInput = document.getElementById('etitle');
        expect(etitleInput).toBeInTheDocument();
    });

    it('has edit description input in modal', () => {
        renderNotes();

        const edescriptionInput = document.getElementById('edescription');
        expect(edescriptionInput).toBeInTheDocument();
    });

    it('has edit tag input in modal', () => {
        renderNotes();

        const etagInput = document.getElementById('etag');
        expect(etagInput).toBeInTheDocument();
    });

    it('updates edit form inputs on change', () => {
        renderNotes();

        const etitleInput = document.getElementById('etitle');
        const edescriptionInput = document.getElementById('edescription');
        const etagInput = document.getElementById('etag');

        fireEvent.change(etitleInput, { target: { value: 'New Title', name: 'etitle' } });
        fireEvent.change(edescriptionInput, { target: { value: 'New Description', name: 'edescription' } });
        fireEvent.change(etagInput, { target: { value: 'newtag', name: 'etag' } });

        expect(etitleInput.value).toBe('New Title');
        expect(edescriptionInput.value).toBe('New Description');
        expect(etagInput.value).toBe('newtag');
    });
});

describe('Notes Component - Rendering', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'test-token');
    });

    it('renders note items with correct props', () => {
        renderNotes();

        // Check that note cards are rendered
        expect(screen.getByText('Description 1')).toBeInTheDocument();
        expect(screen.getByText('Description 2')).toBeInTheDocument();
    });

    it('renders multiple notes correctly', () => {
        const manyNotes = Array.from({ length: 10 }, (_, i) => ({
            _id: String(i),
            title: `Note ${i}`,
            description: `Description ${i}`,
            tag: `tag${i}`,
            date: new Date().toISOString(),
        }));

        renderNotes(manyNotes);

        expect(screen.getByText('Note 0')).toBeInTheDocument();
        expect(screen.getByText('Note 9')).toBeInTheDocument();
    });
});
