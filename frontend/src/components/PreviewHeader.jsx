function PreviewHeader({ status }) {
  return (
    <section className="preview-hero">
      <p className="eyebrow">React migration preview</p>
      <h1>SnapEats is moving to React one feature at a time.</h1>
      <p>
        This page is separate from the current vanilla app, so every migration
        commit can be reviewed safely before replacing the live experience.
      </p>
      <div className="status-pill">{status}</div>
    </section>
  );
}

export default PreviewHeader;
