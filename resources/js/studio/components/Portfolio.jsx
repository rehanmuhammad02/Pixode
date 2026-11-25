import { useState, useRef } from "react";
import SectionHeading from "./SectionHeading";
import Icon from "./Icon";
import Button from "./Button";
import CardGrid from "./CardGrid";
const labels = {
  all: "All work",
  digital: "Web & apps",
  brand: "Brand identity",
  logo: "Logos",
  banner: "Campaigns",
};
export function ProjectVisual({ project, index = 0 }) {
  return (
    <div
      className={`project-visual visual-${project.category || "digital"} variant-${index % 4}`}
    >
      {project.image ? (
        <img
          src={project.image}
          alt={`${project.title} design concept`}
          loading="lazy"
          width="900"
          height="650"
        />
      ) : (
        <div className="concept-art">
          <span className="concept-label">
            {project.category === "digital"
              ? "DIGITAL EXPERIENCE"
              : "A NEW PERSPECTIVE"}
          </span>
          <div className="concept-mark">
            <Icon
              name={
                project.category === "logo"
                  ? "layers"
                  : project.category === "banner"
                    ? "direction"
                    : project.category === "brand"
                      ? "target"
                      : "globe"
              }
              size={90}
            />
          </div>
          <strong>
            {project.title}
            <span>.</span>
          </strong>
          <div className="concept-caption">
            <span>PIXODE / CONCEPT EXPLORATION</span>
            <span>© {project.year || "2026"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
export default function Portfolio({ projects, workNote }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const open = (project) => {
    setSelected(project);
    dialog.current.showModal();
  };
  const visible = projects.filter(
    (p) => filter === "all" || p.category === filter,
  );
  return (
    <section className="section container work-section" id="work">
      <SectionHeading
        eyebrow="SELECTED EXPLORATIONS"
        title={
          <>
            Good ideas.
            <br />
            <span>Made impossible to ignore.</span>
          </>
        }
        description="A selection of design directions across brands, websites and digital products."
      />
      <div className="work-toolbar">
        <div className="filter-tabs" aria-label="Filter projects">
          {Object.entries(labels).map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? "active" : ""}
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="small-label">{workNote}</span>
      </div>
      <CardGrid className="project-grid" label="Portfolio projects" resetKey={filter}>
        {visible.map((project, index) => (
          <button
            className="project-card"
            key={project.id}
            onClick={() => open(project)}
            aria-label={`Explore ${project.title}`}
          >
            <ProjectVisual project={project} index={index} />
            <div className="project-info">
              <div>
                <h3>{project.title}</h3>
                <span>
                  {labels[project.category]} / {project.year || "2026"}
                </span>
              </div>
              <span className="project-arrow">
                <Icon name="arrow-up-right" />
              </span>
            </div>
          </button>
        ))}
      </CardGrid>
      {!visible.length && (
        <p className="empty-state">New work in this category is on its way.</p>
      )}
      <dialog
        ref={dialog}
        className="project-dialog"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        <button
          className="dialog-close icon-button"
          aria-label="Close project"
          onClick={() => dialog.current.close()}
        >
          <Icon name="close" />
        </button>
        {selected && (
          <>
            <ProjectVisual project={selected} />
            <div className="project-dialog-copy">
              <span className="eyebrow">CONCEPT EXPLORATION</span>
              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
              <div className="tag-row">
                {selected.tags
                  .split(/[,/·]/)
                  .filter(Boolean)
                  .map((tag) => (
                    <span key={tag}>{tag.trim()}</span>
                  ))}
              </div>
              <Button href="#contact" onClick={() => dialog.current.close()}>
                Build something like this
              </Button>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
