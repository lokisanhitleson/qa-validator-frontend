"use client";

import Link from "next/link";
import { Project } from "@/interfaces";
import mockProjects from "@/data/mock-projects.json";

const projects = mockProjects as Project[];

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Projects</h1>
        <p className="mt-1 text-sm text-muted">
          Select a project to view its requirements, test cases, and traceability
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}/overview`}
            className="group rounded-xl border border-card-border bg-card-bg p-6 transition-shadow hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                {project.name}
              </h2>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                  project.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : project.status === "Completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {project.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{project.description}</p>
            <p className="mt-4 text-xs text-muted">
              Created {project.createdAt}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
