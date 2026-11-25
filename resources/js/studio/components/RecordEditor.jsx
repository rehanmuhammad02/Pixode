import { useEffect, useRef, useState } from "react";
import { schemas } from "../lib/editor-schema";
import { api } from "../lib/api";
import Icon from "./Icon";
import Button from "./Button";

export default function RecordEditor({ editing, csrf, onSave, onClose }) {
  const dialog = useRef(null);
  const [values, setValues] = useState(
    editing.type === "settings"
      ? { ...editing.record }
      : {
          published: true,
          featured: false,
          rating: 5,
          category: editing.type === "packages" ? "brand" : "digital",
          role: "editor",
          icon: "pen",
          service: "The full experience",
          ...editing.record,
        },
  );
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  const change = (key, value) =>
    setValues((previous) => ({ ...previous, [key]: value }));
  const upload = async (key, file) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      if (file.size > 5242880) throw new Error("Upload an image under 5 MB.");
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await api("/api/admin/upload", {
        method: "POST",
        csrf,
        body: { data },
      });
      change(key, result.url);
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const record = { ...values };
      if (record.features && !Array.isArray(record.features))
        record.features = record.features
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
      if (record.rating) record.rating = Number(record.rating);
      if (record.price !== undefined) record.price = Number(record.price);
      await onSave(record);
    } catch (error) {
      setError(error.message);
      setBusy(false);
    }
  };
  return (
    <dialog
      className="editor-dialog"
      ref={dialog}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
      aria-labelledby="editor-title"
    >
      <div className="editor-head">
        <div>
          <span className="eyebrow">STUDIO / {editing.type.toUpperCase()}</span>
          <h2 id="editor-title">
            {editing.record?.id
              ? "Refine the details."
              : "Make your next addition."}
          </h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close editor"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      <form id="editor-form" onSubmit={submit}>
        <div className="editor-fields">
          {schemas[editing.type].map(
            ([key, label, type, required, options]) => (
              <label
                key={key}
                className={`${["textarea", "lines", "image"].includes(type) ? "full" : ""} ${type === "checkbox" ? "checkbox-field" : ""}`}
              >
                {type !== "checkbox" && <span>{label}</span>}
                {type === "select" ? (
                  <select
                    name={key}
                    required={required}
                    value={values[key] || options[0]}
                    onChange={(e) => change(key, e.target.value)}
                  >
                    {options.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                ) : type === "checkbox" ? (
                  <>
                    <input
                      name={key}
                      type="checkbox"
                      checked={!!values[key]}
                      onChange={(e) => change(key, e.target.checked)}
                    />
                    {label}
                  </>
                ) : type === "textarea" || type === "lines" ? (
                  <textarea
                    name={key}
                    rows="4"
                    required={required}
                    maxLength="5000"
                    value={
                      Array.isArray(values[key])
                        ? values[key].join("\n")
                        : values[key] || ""
                    }
                    onChange={(e) => change(key, e.target.value)}
                  />
                ) : (
                  <input
                    name={key}
                    type={type === "image" ? "text" : type}
                    value={values[key] ?? ""}
                    onChange={(e) => change(key, e.target.value)}
                    required={
                      type === "password" ? !editing.record?.id : required
                    }
                    min={type === "number" ? "0" : undefined}
                    minLength={type === "password" ? "12" : undefined}
                    maxLength={type === "password" ? "128" : "5000"}
                    autoComplete={type === "password" ? "new-password" : "off"}
                  />
                )}{" "}
                {type === "image" && (
                  <>
                    <span className="upload-field">
                      <Icon name="upload" size={16} />
                      {uploading ? "Uploading…" : "Upload PNG, JPEG or WebP"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={uploading}
                        aria-label={`Upload ${label}`}
                        onChange={(e) => upload(key, e.target.files[0])}
                      />
                    </span>
                    {values[key] && (
                      <img
                        className="editor-image"
                        src={values[key]}
                        alt="Selected image preview"
                      />
                    )}
                  </>
                )}
                {type === "password" && (
                  <small>
                    {editing.record?.id
                      ? "Leave blank to keep the current password."
                      : "Choose a unique initial password and share it privately."}
                  </small>
                )}
              </label>
            ),
          )}
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="editor-foot">
          <Button onClick={onClose} variant="secondary" icon={null}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={busy || uploading}
            icon={busy ? "loader" : "save"}
          >
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
