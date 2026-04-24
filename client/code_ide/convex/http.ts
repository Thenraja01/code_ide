import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/write_ghost_file",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { projectId, file } = await request.json();
    
    let parentId = undefined;
    if (file.parentPath && projectId) {
      const files = await ctx.runQuery(api.files.getFilesByProject, { projectId: projectId as any });
      const parentFolder = files.find(f => f.type === "folder" && f.name === file.parentPath);
      if (parentFolder) {
        parentId = parentFolder._id;
      }
    }

    await ctx.runMutation(api.files.createFile, {
      projectId: projectId as any,
      name: file.name,
      type: file.type,
      content: file.content || "",
      parentId: parentId as any
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: new Headers({ "Access-Control-Allow-Origin": "*" }),
    });
  }),
});

http.route({
    path: "/update_build_state",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const { projectId, buildState } = await request.json();
      
      await ctx.runMutation(api.projects.updateBuildState, {
        projectId,
        buildState
      });
  
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: new Headers({ "Access-Control-Allow-Origin": "*" }),
      });
    }),
});

http.route({
  path: "/update_job_status",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { fileId, sessionId, status, userId, requestId } = await request.json();
    await ctx.runMutation(api.jobStatus.updateStatus, {
      fileId,
      sessionId,
      status,
      userId,
      requestId
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: new Headers({ "Access-Control-Allow-Origin": "*" }),
    });
  }),
});

http.route({
  path: "/update_file_content",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { fileId, content, userId, requestId } = await request.json();
    await ctx.runMutation(api.files.updateFileContent, {
      fileId,
      content,
      userId
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: new Headers({ "Access-Control-Allow-Origin": "*" }),
    });
  }),
});

export default http;
