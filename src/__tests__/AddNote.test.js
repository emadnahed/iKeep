import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddNote from '../components/AddNote';
import NoteContext from '../context/notes/noteContext';

const mockAddNote = jest.fn();
const mockEditNote = jest.fn();
const mockShowAlert = jest.fn();

const mockContextValue = {
    notes: [],
    addNote: mockAddNote,
    editNote: mockEditNote,
    deleteNote: jest.fn(),
    getNotes: jest.fn(),
};

const renderAddNote = () => {
    return render(
        <NoteContext.Provider value={mockContextValue}>
            <AddNote showAlert={mockShowAlert} />
        </NoteContext.Provider>
    );
};

describe('AddNote Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders add note form correctly', () => {
        renderAddNote();

        expect(screen.getByText('Add a Note')).toBeInTheDocument();
        expect(screen.getByLabelText('Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
        expect(screen.getByLabelText('Tag')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add note/i })).toBeInTheDocument();
    });

    it('updates input values on change', () => {
        renderAddNote();

        const titleInput = screen.getByLabelText('Title');
        const descriptionInput = screen.getByLabelText('Description');
        const tagInput = screen.getByLabelText('Tag');

        fireEvent.change(titleInput, { target: { value: 'Test Title', name: 'title' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Description', name: 'description' } });
        fireEvent.change(tagInput, { target: { value: 'test-tag', name: 'tag' } });

        expect(titleInput.value).toBe('Test Title');
        expect(descriptionInput.value).toBe('Test Description');
        expect(tagInput.value).toBe('test-tag');
    });

    it('disables submit button when title is too short', () => {
        renderAddNote();

        const titleInput = screen.getByLabelText('Title');
        const descriptionInput = screen.getByLabelText('Description');
        const submitButton = screen.getByRole('button', { name: /add note/i });

        fireEvent.change(titleInput, { target: { value: 'abc', name: 'title' } });
        fireEvent.change(descriptionInput, { target: { value: 'Valid description text', name: 'description' } });

        expect(submitButton).toBeDisabled();
    });

    it('disables submit button when description is too short', () => {
        renderAddNote();

        const titleInput = screen.getByLabelText('Title');
        const descriptionInput = screen.getByLabelText('Description');
        const submitButton = screen.getByRole('button', { name: /add note/i });

        fireEvent.change(titleInput, { target: { value: 'Valid Title Here', name: 'title' } });
        fireEvent.change(descriptionInput, { target: { value: 'abc', name: 'description' } });

        expect(submitButton).toBeDisabled();
    });

    it('enables submit button when form is valid', () => {
        renderAddNote();

        const titleInput = screen.getByLabelText('Title');
        const descriptionInput = screen.getByLabelText('Description');
        const submitButton = screen.getByRole('button', { name: /add note/i });

        fireEvent.change(titleInput, { target: { value: 'Valid Title', name: 'title' } });
        fireEvent.change(descriptionInput, { target: { value: 'Valid Description', name: 'description' } });

        expect(submitButton).not.toBeDisabled();
    });

    it('calls addNote and showAlert on form submission', () => {
        renderAddNote();

        const titleInput = screen.getByLabelText('Title');
        const descriptionInput = screen.getByLabelText('Description');
        const tagInput = screen.getByLabelText('Tag');
        const submitButton = screen.getByRole('button', { name: /add note/i });

        fireEvent.change(titleInput, { target: { value: 'Test Note Title', name: 'title' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Note Description', name: 'description' } });
        fireEvent.change(tagInput, { target: { value: 'test', name: 'tag' } });

        fireEvent.click(submitButton);

        expect(mockAddNote).toHaveBeenCalledWith('Test Note Title', 'Test Note Description', 'test');
        expect(mockShowAlert).toHaveBeenCalledWith('Note Added successfully', 'success');
    });

    it('clears form after submission', () => {
        renderAddNote();

        const titleInput = screen.getByLabelText('Title');
        const descriptionInput = screen.getByLabelText('Description');
        const tagInput = screen.getByLabelText('Tag');
        const submitButton = screen.getByRole('button', { name: /add note/i });

        fireEvent.change(titleInput, { target: { value: 'Test Note Title', name: 'title' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Note Description', name: 'description' } });
        fireEvent.change(tagInput, { target: { value: 'test', name: 'tag' } });

        fireEvent.click(submitButton);

        expect(titleInput.value).toBe('');
        expect(descriptionInput.value).toBe('');
        expect(tagInput.value).toBe('');
    });

    it('can add a note with empty tag', () => {
        renderAddNote();

        const titleInput = screen.getByLabelText('Title');
        const descriptionInput = screen.getByLabelText('Description');
        const submitButton = screen.getByRole('button', { name: /add note/i });

        fireEvent.change(titleInput, { target: { value: 'Test Note Title', name: 'title' } });
        fireEvent.change(descriptionInput, { target: { value: 'Test Note Description', name: 'description' } });

        fireEvent.click(submitButton);

        // addNote should be called with empty string for tag
        expect(mockAddNote).toHaveBeenCalledWith('Test Note Title', 'Test Note Description', '');
    });
});
