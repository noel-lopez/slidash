# Speaker notes live in a separate, gitignorable file

Presenter notes do not live co-located inside `index.html`. They live in their own file that can be `.gitignore`d, and the presenter view does a silent no-op when that file is absent.

The driving constraint is real and not obvious from the code: a presentation is typically opened locally (`file://`) by the presenter *and* deployed publicly (e.g. GitHub Pages, trivial for plain HTML/CSS/JS). The presenter wants notes locally but must not ship them in the public deploy. With a no-build, `file://` model you cannot strip part of a file on deploy, and `.gitignore` can only exclude whole files — so notes must be a separate file. Co-locating notes inside each slide (more robust against reordering, fewer moving parts) was rejected for exactly this reason.

The file's internal shape (a positional array vs. a map keyed by slide id) is an implementation detail and free to change. MVP uses a positional array: lower token overhead, and the desync risk that keying-by-id would prevent is unlikely in an agentic flow where the agent edits the whole file with full context.
