import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStudio } from "../context/StudioContext";
import { api, formatMoney } from "../lib/api";
import { schemas } from "../lib/editor-schema";
import Brand from "../components/Brand";
import Icon from "../components/Icon";
import Button from "../components/Button";
import RecordEditor from "../components/RecordEditor";
import { ProjectVisual } from "../components/Portfolio";

const navigation = [
  ["overview", "Studio overview", "grid"],
  ["projects", "Portfolio", "briefcase"],
  ["testimonials", "Client feedback", "message"],
  ["packages", "Pricing plans", "currency"],
  ["services", "Services", "layers"],
  ["faqs", "FAQs", "help"],
  ["clients", "Client directory", "users"],
  ["benefits", "Partnership promises", "check"],
  ["inquiries", "Inquiry inbox", "inbox"],
  ["settings", "Page content", "settings"],
  ["users", "Users & access", "users"],
];
export default function Dashboard() {
  const { session, setSession, logout, theme, toggleTheme, refreshContent } =
    useStudio();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState(null);
  const [storage, setStorage] = useState(null);
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [options, setOptions] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [notification, setNotification] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compact, setCompact] = useState(() => {
    try {
      return localStorage.getItem("pixode-sidebar-compact") === "true";
    } catch {
      return false;
    }
  });
  const sidebar = useRef(null);
  const toggle = useRef(null);
  const [smallScreen, setSmallScreen] = useState(
    () => matchMedia("(max-width: 900px)").matches,
  );
  const closeSidebar = useCallback(() => {
    setMobileOpen(false);
    requestAnimationFrame(() => toggle.current?.focus({ preventScroll: true }));
  }, []);
  const member = session.user.role === "member";
  const owner = session.user.role === "owner";
  const section = location.pathname.split("/")[2] || "overview";
  const items = navigation.filter(([key]) =>
    member ? key === "overview" : key !== "users" || owner,
  );
  useEffect(() => {
    if (!items.some(([key]) => key === section))
      navigate("/admin/overview", { replace: true });
  }, [section, member, owner, navigate]);
  useEffect(() => {
    const screen = matchMedia("(max-width: 900px)");
    const resized = (event) => {
      setSmallScreen(event.matches);
      if (!event.matches) setMobileOpen(false);
    };
    screen.addEventListener("change", resized);
    return () => screen.removeEventListener("change", resized);
  }, []);
  const title =
    items.find(([key]) => key === section)?.[1] || "Studio overview";
  const request = useCallback(
    (path, value = {}) => api(path, { ...value, csrf: session.csrf }),
    [session.csrf],
  );
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const opts = await request("/api/admin/auth-options");
      setOptions(opts);
      if (!member) {
        const [data, messages] = await Promise.all([
          request("/api/admin/content"),
          request("/api/admin/inquiries"),
        ]);
        setContent(data.content);
        setStorage(data.storage);
        setUsers(data.users);
        setInquiries(messages);
      }
    } catch (error) {
      if (error.status === 401) {
        setSession(null);
        navigate("/login", { replace: true });
      } else setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [request, member, navigate, setSession]);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (location.hash)
      navigate(`/admin/${location.hash.slice(1)}`, { replace: true });
  }, [location.hash, navigate]);
  useEffect(() => {
    setMobileOpen(false);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = `${title} Pixode`;
  }, [section, title]);
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 4500);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  useEffect(() => {
    document.body.classList.toggle("drawer-lock", mobileOpen);
    if (mobileOpen) {
      const active =
        sidebar.current.querySelector('nav a[aria-current="page"]') ||
        sidebar.current.querySelector("nav a");
      active?.focus({ preventScroll: true });
      active?.scrollIntoView({ block: "nearest", behavior: "instant" });
    }
    const key = (event) => {
      if (!mobileOpen) return;
      if (event.key === "Escape") {
        closeSidebar();
      }
      if (event.key === "Tab") {
        const stops = [...sidebar.current.querySelectorAll("a,button")].filter(
          (el) => el.getClientRects().length,
        );
        if (event.shiftKey && document.activeElement === stops[0]) {
          event.preventDefault();
          stops.at(-1).focus();
        } else if (!event.shiftKey && document.activeElement === stops.at(-1)) {
          event.preventDefault();
          stops[0].focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.classList.remove("drawer-lock");
      document.removeEventListener("keydown", key);
    };
  }, [mobileOpen, closeSidebar]);
  const toggleSidebar = () => {
    if (matchMedia("(max-width: 900px)").matches) setMobileOpen(!mobileOpen);
    else {
      setCompact(!compact);
      try {
        localStorage.setItem("pixode-sidebar-compact", String(!compact));
      } catch {}
    }
  };
  const save = async (record) => {
    if (editing.type === "users") {
      await request("/api/admin/users", { method: "POST", body: record });
      if (record.id === session.user.id) {
        const current = await api("/api/admin/session");
        if (!current.user) {
          setSession(null);
          navigate("/login");
          return;
        }
        setSession(current);
      }
      await load();
    } else {
      setContent(
        await request(`/api/admin/${editing.type}`, {
          method: "POST",
          body: { item: record, revision: content.revision },
        }),
      );
      await refreshContent();
    }
    setEditing(null);
    setNotification(
      editing.type === "users"
        ? "Account saved. Send verification before the user’s first login."
        : "Saved. Your published content is up to date.",
    );
  };
  const remove = async (record) => {
    if (
      !window.confirm(
        `Delete “${record.title || record.name || record.question}”? This removes the record permanently.`,
      )
    )
      return;
    try {
      const result = await request(`/api/admin/${section}/${record.id}`, {
        method: "DELETE",
        body: { revision: content.revision },
      });
      if (section === "users") await load();
      else {
        setContent(result);
        await refreshContent();
      }
      setNotification("Record deleted.");
    } catch (error) {
      setError(error.message);
    }
  };
  const sendVerification = async (user) => {
    try {
      const result = await request(`/api/admin/users/${user.id}/verification`, {
        method: "POST",
        body: {},
      });
      setNotification(result.message);
    } catch (error) {
      setError(error.message);
    }
  };
  const signOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      setError(error.message);
    }
  };
  const records =
    section === "users"
      ? users
      : section === "inquiries"
        ? inquiries
        : Array.isArray(content?.[section])
          ? content[section]
          : [];
  const filtered = records.filter((record) =>
    [
      record.title,
      record.name,
      record.email,
      record.question,
      record.quote,
      record.service,
      record.description,
      record.role,
      record.message,
      record.company,
      record.notes,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
  );
  return (
    <div
      className={`workspace ${compact ? "compact" : ""} ${mobileOpen ? "drawer-open" : ""}`}
    >
      <button
        className="sidebar-backdrop"
        hidden={!mobileOpen}
        onClick={closeSidebar}
        aria-label="Close navigation"
      />
      <aside
        id="workspace-navigation"
        className="workspace-sidebar"
        ref={sidebar}
        inert={smallScreen && !mobileOpen}
      >
        <div className="workspace-brand">
          <Brand
            to="/admin"
            logo={content?.settings.logo}
            compact={compact && !mobileOpen}
          />
        </div>
        <span className="sidebar-label">YOUR WORKSPACE</span>
        <nav aria-label="Studio navigation">
          {items.map(([key, label, icon]) => (
            <Link
              key={key}
              to={`/admin/${key}`}
              className={section === key ? "active" : ""}
              aria-current={section === key ? "page" : undefined}
              aria-label={label}
              title={label}
            >
              <Icon name={icon} size={18} />
              <span>{label}</span>
              {[
                "projects",
                "testimonials",
                "packages",
                "users",
                "inquiries",
              ].includes(key) && (
                <small>
                  {key === "users"
                    ? users.length
                    : key === "inquiries"
                      ? inquiries.length
                      : content?.[key]?.length || 0}
                </small>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <a href="/" target="_blank" rel="noopener" className="view-site">
            View live website
            <Icon name="arrow-up-right" size={16} />
          </a>
          <div className="workspace-profile">
            <span className="profile-avatar">
              {session.user.name.slice(0, 1)}
            </span>
            <div>
              <strong>{session.user.name}</strong>
              <span>{session.user.role}</span>
            </div>
            <button
              className="icon-button"
              onClick={signOut}
              aria-label="Sign out"
            >
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace-body" inert={mobileOpen}>
        <header className="workspace-header">
          <button
            className="icon-button"
            ref={toggle}
            onClick={toggleSidebar}
            aria-label={mobileOpen ? "Close navigation" : "Toggle navigation"}
            aria-expanded={smallScreen ? mobileOpen : !compact}
            aria-controls="workspace-navigation"
          >
            <Icon name="menu" />
          </button>
          <div>
            <span className="eyebrow">WORKSPACE / {section.toUpperCase()}</span>
            <h1>{member ? "Your workspace" : title}</h1>
          </div>
          <div className="workspace-header-actions">
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
            <button
              className="icon-button"
              onClick={load}
              aria-label="Refresh workspace"
            >
              <Icon name="refresh" />
            </button>
            <Button href="/" target="_blank" rel="noopener" aria-label="Preview website" title="Preview website">
              Preview website
            </Button>
          </div>
        </header>
        <main className="workspace-main" id="admin-main">
          {error && (
            <div className="workspace-error" role="alert">
              {error}
              <button onClick={load}>Refresh</button>
            </div>
          )}
          {loading ? (
            <div className="workspace-loading">
              <Icon name="loader" className="spin" />
              Getting your workspace ready…
            </div>
          ) : member ? (
            <>
              <div className="welcome-banner">
                <span className="eyebrow">YOUR PIXODE ACCOUNT</span>
                <h2>Welcome, {session.user.name.split(" ")[0]}.</h2>
                <p>
                  Your next idea deserves a thoughtful beginning. Tell us what
                  you’d like to build, redesign or improve.
                </p>
                <Button href="/#contact">Tell us about your project</Button>
              </div>
              <div className="member-card">
                <Icon name="shield" />
                <h3>Your account</h3>
                <p>{session.user.email}</p>
                <span className="status-pill published">
                  Verified email · Client access
                </span>
              </div>
            </>
          ) : (
            content &&
            (section === "overview" ? (
              <Overview
                content={content}
                users={users}
                inquiries={inquiries}
                name={session.user.name}
                owner={owner} storage={storage}
              />
            ) : section === "settings" ? (
              <Settings
                content={content}
                onSave={async (settings) => {
                  setContent(
                    await request("/api/admin/settings", {
                      method: "PUT",
                      body: { settings, revision: content.revision },
                    }),
                  );
                  await refreshContent();
                  setNotification("Page content saved.");
                }}
                csrf={session.csrf}
              />
            ) : (
              <>
                <div className="workspace-toolbar">
                  <div>
                    <h2>
                      {section === "users"
                        ? "Your people. The right access."
                        : section === "inquiries"
                          ? "Good conversations start here."
                          : "Make your next update."}
                    </h2>
                    <p>
                      {section === "users"
                        ? "Owners manage access. Editors manage content. Members have client access."
                        : section === "inquiries"
                          ? "Project inquiries from your website, all in one place."
                          : "Keep your content considered, current and ready to share."}
                    </p>
                  </div>
                  {section !== "inquiries" && (
                    <Button
                      icon="plus"
                      onClick={() => setEditing({ type: section, record: {} })}
                    >
                      Add {section === "users" ? "account" : "new"}
                    </Button>
                  )}
                </div>
                {section === "users" && (
                  <div className="access-summary">
                    {[
                      [
                        "People",
                        `${users.length} ${users.length === 1 ? "account" : "accounts"}`,
                      ],
                      [
                        "Email verification",
                        options.emailVerification
                          ? "Email delivery connected"
                          : "Configure Resend in .env",
                      ],
                      [
                        "Google sign-in",
                        options.google
                          ? "Connected"
                          : "Configure Google OAuth in .env",
                      ],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                )}
                <label className="workspace-search">
                  <Icon name="search" size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={`Search ${title.toLowerCase()}…`}
                    aria-label={`Search ${title}`}
                  />
                  <span>{filtered.length} records</span>
                </label>
                {section === "users" ? (
                  <div className="table-wrap">
                    <table className="user-table">
                      <thead>
                        <tr>
                          {[
                            "Name",
                            "Email",
                            "Role",
                            "Email status",
                            "Actions",
                          ].map((label) => (
                            <th key={label}>{label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <strong>{user.name}</strong>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              <span className="role-pill">{user.role}</span>
                            </td>
                            <td>
                              <span
                                className={`status-pill ${user.verified ? "published" : "draft"}`}
                              >
                                {user.verificationExempt
                                  ? "Owner access"
                                  : user.verified
                                    ? "Verified"
                                    : "Awaiting verification"}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() =>
                                  setEditing({
                                    type: "users",
                                    record: { ...user, password: "" },
                                  })
                                }
                              >
                                <Icon name="pen" size={15} />
                                Edit
                              </button>
                              {!user.verified && (
                                <button onClick={() => sendVerification(user)}>
                                  <Icon name="mail" size={15} />
                                  Send verification
                                </button>
                              )}
                              {user.id !== session.user.id && (
                                <button
                                  onClick={() => remove(user)}
                                  aria-label={`Delete ${user.name}`}
                                >
                                  <Icon name="trash" size={15} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : section === "inquiries" ? (
                  <div className="inquiry-grid">
                    {filtered.map((item) => (
                      <article className="inquiry-card" key={item.id}>
                        <div>
                          <span className="eyebrow">
                            {new Date(item.receivedAt).toLocaleDateString()}
                          </span>
                          <Icon name="inbox" />
                        </div>
                        <h3>{item.name}</h3>
                        <a href={`mailto:${item.email}`}>
                          {item.email}
                          <Icon name="arrow-up-right" size={14} />
                        </a>
                        <span className="role-pill">{item.service}</span>
                        <p>{item.message}</p>
                        {item.company && <small>{item.company}</small>}
                      </article>
                    ))}
                  </div>
                ) : (
                  <div
                    className={`record-grid ${section === "faqs" ? "record-list" : ""}`}
                  >
                    {filtered.map((record, index) => (
                      <article className="record-card" key={record.id}>
                        {section === "projects" && (
                          <ProjectVisual project={record} index={index} />
                        )}
                        <div className="record-body">
                          <div className="record-status">
                            <span className="small-label">
                              {record.category || section}
                            </span>
                            {record.published !== undefined && (
                              <span
                                className={`status-pill ${record.published ? "published" : "draft"}`}
                              >
                                {record.published ? "Published" : "Draft"}
                              </span>
                            )}
                          </div>
                          <h3>
                            {record.title || record.name || record.question}
                          </h3>
                          {section === "packages" && (
                            <strong className="record-price">
                              {formatMoney(record.price)}
                            </strong>
                          )}
                          <p>
                            {record.quote ||
                              record.description ||
                              record.answer ||
                              record.notes ||
                              record.email}
                          </p>
                          <div className="record-actions">
                            <button
                              onClick={() =>
                                setEditing({ type: section, record })
                              }
                            >
                              <Icon name="pen" size={16} />
                              Edit details
                            </button>
                            <button
                              aria-label={`Delete ${record.title || record.name || record.question}`}
                              onClick={() => remove(record)}
                            >
                              <Icon name="trash" size={16} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                {!filtered.length && (
                  <div className="empty-state">
                    <Icon name="layers" size={28} />
                    <h3>
                      {query
                        ? "No matches yet."
                        : "A fresh space for your next addition."}
                    </h3>
                    <p>
                      {query
                        ? "Try a different name or keyword."
                        : section === "inquiries"
                          ? "New project inquiries will appear here."
                          : "Use the button above to add your first record."}
                    </p>
                  </div>
                )}
              </>
            ))
          )}
        </main>
      </div>
      {notification && (
        <div className="toast" role="status">
          <Icon name="success" size={19} />
          {notification}
        </div>
      )}
      {editing && (
        <RecordEditor
          key={`${editing.type}-${editing.record.id || "new"}`}
          editing={editing}
          csrf={session.csrf}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function Overview({ content, users, inquiries, name, owner, storage }) {
  return (
    <>
            <div className="storage-strip">
        <div className="storage-status"><span className="status-dot" />{storage?.label || "Laravel database"} connected</div>
        <div className="storage-flow"><span>Dashboard save</span><Icon name="arrow-right" size={13} /><span>Database</span><Icon name="arrow-right" size={13} /><span>Website &amp; dashboard</span></div>
        <span>Saved revision {content.revision}</span>
      </div><div className="welcome-banner">
        <span className="eyebrow">YOUR CREATIVE CONTROL ROOM</span>
        <h2>Welcome back,<br/><span>{name.split(" ")[0]}.</span></h2>
        <p>
          Shape what the world sees. Keep your work current, your stories
          considered and your next opportunity close.
        </p>
        <Link to="/admin/settings" className="button button-primary">
          Manage your website
          <Icon name="arrow-up-right" size={18} />
        </Link>
        <div className="welcome-decoration" aria-hidden="true" />
      </div>
      <div className="stats-grid">
        {[
          ["Portfolio projects", content.projects.length, "briefcase"],
          ["Client stories", content.testimonials.length, "message"],
          ["Pricing plans", content.packages.length, "currency"],
          ["New inquiries", inquiries.length, "inbox"],
        ].map(([label, value, icon]) => (
          <article key={label}>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
            <span className="stat-icon">
              <Icon name={icon} />
            </span>
          </article>
        ))}
      </div>
      <div className="overview-heading">
        <h2>Your next move, made simple.</h2>
        <span className="small-label">YOUR NEXT UPDATE</span>
      </div>
      <div className="overview-actions">
        {[
          [
            "projects",
            "Share your latest work",
            "Add a project or refresh a creative direction.",
            "briefcase",
          ],
          [
            "testimonials",
            "Share a client story",
            "Publish authorized feedback from your clients.",
            "message",
          ],
          [
            "packages",
            "Refine your packages",
            "Keep pricing and deliverables up to date.",
            "currency",
          ],
          ...(owner
            ? [
                [
                  "users",
                  "Bring the right people in",
                  `${users.length} account${users.length === 1 ? "" : "s"}. Manage access and verification.`,
                  "users",
                ],
              ]
            : []),
        ].map(([key, title, description, icon]) => (
          <Link to={`/admin/${key}`} key={key}>
            <Icon name={icon} size={24} />
            <h3>{title}</h3>
            <p>{description}</p>
            <Icon name="arrow-up-right" size={18} />
          </Link>
        ))}
      </div>
      <div className="overview-heading">
        <h2>Recent portfolio</h2>
        <Link to="/admin/projects">
          Manage projects
          <Icon name="arrow-up-right" size={16} />
        </Link>
      </div>
      <div className="overview-projects">
        {content.projects.slice(-3).map((project, index) => (
          <Link key={project.id} to="/admin/projects">
            <ProjectVisual project={project} index={index} />
            <strong>{project.title}</strong>
            <span
              className={`status-pill ${project.published ? "published" : "draft"}`}
            >
              {project.published ? "Published" : "Draft"}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
function Settings({ content, onSave, csrf }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <div className="workspace-toolbar">
        <div>
          <h2>Your brand. Your words.</h2>
          <p>
            Edit your hero, studio story, contact details, theme, supported
            platforms and footer.
          </p>
        </div>
        <Button onClick={() => setEditing(true)} icon="pen">
          Edit page content
        </Button>
      </div>
      <div className="settings-preview">
        <Brand logo={content.settings.logo} />
        <h2>
          {content.settings.heroLine1}
          <br />
          {content.settings.heroLine2}
        </h2>
        <p>{content.settings.heroDescription}</p>
        <div className="tag-row">
          <span>{content.settings.defaultTheme} theme</span>
          <span>
            {content.settings.platformList.split("\n").length} platforms
          </span>
          <span>Revision {content.revision}</span>
        </div>
      </div>
      <div className="settings-summary">
        {schemas.settings.map(([key, label]) => (
          <div key={key}>
            <span>{label}</span>
            <p>{content.settings[key] || "Not set"}</p>
          </div>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
      {editing && (
        <RecordEditor
          editing={{ type: "settings", record: content.settings }}
          csrf={csrf}
          onClose={() => setEditing(false)}
          onSave={async (record) => {
            await onSave(record);
            setEditing(false);
          }}
        />
      )}
    </>
  );
}
