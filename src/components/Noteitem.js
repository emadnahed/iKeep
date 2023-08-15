import React from "react";

export default function Noteitem(note) {
  return (
    <div className="col-md-3 my-3">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{note.title}</h5>
          <p className="card-text">{note.description}</p>
          {/* <a href="#" className="btn btn-primary">{note.tag}</a> */}
        </div>
      </div>
    </div>
  );
}
