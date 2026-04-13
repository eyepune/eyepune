import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file');
        const projectId = formData.get('project_id');
        const description = formData.get('description');
        const category = formData.get('category') || 'other';

        if (!file || !projectId) {
            return Response.json({ error: 'Missing file or project_id' }, { status: 400 });
        }

        // Upload file
        const uploadResponse = await base44.integrations.Core.UploadFile({ file });
        const fileUrl = uploadResponse.file_url;

        // Create file record
        const fileRecord = await base44.entities.ClientFile.create({
            project_id: projectId,
            file_name: file.name,
            file_url: fileUrl,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: user.email,
            description: description || '',
            category: category
        });

        return Response.json({ 
            success: true, 
            file: fileRecord 
        });
    } catch (error) {
        console.error('File upload error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});