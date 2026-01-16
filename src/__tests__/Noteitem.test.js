import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Noteitem from '../components/Noteitem';
import NoteContext from '../context/notes/noteContext';

const mockDeleteNote = jest.fn();
const mockUpdateNote = jest.fn();
const mockShowAlert = jest.fn();

const mockContextValue = {
    notes: [],
    addNote: jest.fn(),
    editNote: jest.fn(),
    deleteNote: mockDeleteNote,
    getNotes: jest.fn(),
};

const sampleNote = {
    _id: 'note123',
    title: 'Test Note Title',
    description: 'Test Note Description',
    tag: 'test-tag',
    date: new Date().toISOString(),
};

const renderNoteitem = (note = sampleNote) => {
    return render(
        <NoteContext.Provider value={mockContextValue}>
            <Noteitem
                note={note}
                updateNote={mockUpdateNote}
                showAlert={mockShowAlert}
            />
        </NoteContext.Provider>
    );
};

describe('Noteitem Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders note card correctly', () => {
        renderNoteitem();

        expect(screen.getByText('Test Note Title')).toBeInTheDocument();
        expect(screen.getByText('Test Note Description')).toBeInTheDocument();
    });

    it('renders delete icon', () => {
        renderNoteitem();

        const deleteIcon = document.querySelector('.fa-trash');
        expect(deleteIcon).toBeInTheDocument();
    });

    it('renders edit icon', () => {
        renderNoteitem();

        const editIcon = document.querySelector('.fa-pen-to-square');
        expect(editIcon).toBeInTheDocument();
    });

    it('calls deleteNote and showAlert when delete icon is clicked', () => {
        renderNoteitem();

        const deleteIcon = document.querySelector('.fa-trash');
        fireEvent.click(deleteIcon);

        expect(mockDeleteNote).toHaveBeenCalledWith('note123');
        expect(mockShowAlert).toHaveBeenCalledWith('Note deleted successfully', 'success');
    });

    it('calls updateNote when edit icon is clicked', () => {
        renderNoteitem();

        const editIcon = document.querySelector('.fa-pen-to-square');
        fireEvent.click(editIcon);

        expect(mockUpdateNote).toHaveBeenCalledWith(sampleNote);
    });

    it('displays different note content', () => {
        const customNote = {
            _id: 'note456',
            title: 'Another Note',
            description: 'Different description',
            tag: 'work',
            date: new Date().toISOString(),
        };

        renderNoteitem(customNote);

        expect(screen.getByText('Another Note')).toBeInTheDocument();
        expect(screen.getByText('Different description')).toBeInTheDocument();
    });

    it('has correct card structure', () => {
        renderNoteitem();

        expect(document.querySelector('.card')).toBeInTheDocument();
        expect(document.querySelector('.card-body')).toBeInTheDocument();
        expect(document.querySelector('.card-title')).toBeInTheDocument();
        expect(document.querySelector('.card-text')).toBeInTheDocument();
    });

    it('handles long note titles', () => {
        const longTitleNote = {
            ...sampleNote,
            title: 'A'.repeat(100),
        };

        renderNoteitem(longTitleNote);

        expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('handles long note descriptions', () => {
        const longDescNote = {
            ...sampleNote,
            description: 'B'.repeat(500),
        };

        renderNoteitem(longDescNote);

        expect(screen.getByText('B'.repeat(500))).toBeInTheDocument();
    });

    it('handles special characters in note content', () => {
        const specialNote = {
            ...sampleNote,
            title: "Note with <html> & 'quotes'",
            description: "Description with special chars: !@#$%^&*()",
        };

        renderNoteitem(specialNote);

        expect(screen.getByText("Note with <html> & 'quotes'")).toBeInTheDocument();
        expect(screen.getByText("Description with special chars: !@#$%^&*()")).toBeInTheDocument();
    });
});
