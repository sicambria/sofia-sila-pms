var pageSession = new ReactiveDict();

Template.MethodsDetailsCommands.rendered = function() {
	
};

Template.MethodsDetailsCommands.events({
	
});

Template.MethodsDetailsCommands.helpers({
	
});

var MethodsDetailsCommandsViewItems = function(cursor) {
	if(!cursor) {
		return [];
	}

	var searchString = pageSession.get("MethodsDetailsCommandsViewSearchString");
	var sortBy = pageSession.get("MethodsDetailsCommandsViewSortBy");
	var sortAscending = pageSession.get("MethodsDetailsCommandsViewSortAscending");
	if(typeof(sortAscending) == "undefined") sortAscending = true;

	var raw = cursor.fetch();

	// filter
	var filtered = [];
	if(!searchString || searchString == "") {
		filtered = raw;
	} else {
		searchString = searchString.replace(".", "\\.");
		var regEx = new RegExp(searchString, "i");
		var searchFields = ["commandId", "commandName", "command_parameters", "status"];
		filtered = _.filter(raw, function(item) {
			var match = false;
			_.each(searchFields, function(field) {
				var value = (getPropertyValue(field, item) || "") + "";

				match = match || (value && value.match(regEx));
				if(match) {
					return false;
				}
			})
			return match;
		});
	}

	// sort
	if(sortBy) {
		filtered = _.sortBy(filtered, sortBy);

		// descending?
		if(!sortAscending) {
			filtered = filtered.reverse();
		}
	}

	return filtered;
};

var MethodsDetailsCommandsViewExport = function(cursor, fileType) {
	var data = MethodsDetailsCommandsViewItems(cursor);
	var exportFields = ["commandId", "commandName", "command_parameters", "status"];

	var str = convertArrayOfObjects(data, exportFields, fileType);

	var filename = "export." + fileType;

	downloadLocalResource(str, filename, "application/octet-stream");
}


Template.MethodsDetailsCommandsView.rendered = function() {
	pageSession.set("MethodsDetailsCommandsViewStyle", "table");
	
};

Template.MethodsDetailsCommandsView.events({
	"submit #dataview-controls": function(e, t) {
		return false;
	},

	"click #dataview-search-button": function(e, t) {
		e.preventDefault();
		var form = $(e.currentTarget).parent();
		if(form) {
			var searchInput = form.find("#dataview-search-input");
			if(searchInput) {
				searchInput.focus();
				var searchString = searchInput.val();
				pageSession.set("MethodsDetailsCommandsViewSearchString", searchString);
			}

		}
		return false;
	},

	"keydown #dataview-search-input": function(e, t) {
		if(e.which === 13)
		{
			e.preventDefault();
			var form = $(e.currentTarget).parent();
			if(form) {
				var searchInput = form.find("#dataview-search-input");
				if(searchInput) {
					var searchString = searchInput.val();
					pageSession.set("MethodsDetailsCommandsViewSearchString", searchString);
				}

			}
			return false;
		}

		if(e.which === 27)
		{
			e.preventDefault();
			var form = $(e.currentTarget).parent();
			if(form) {
				var searchInput = form.find("#dataview-search-input");
				if(searchInput) {
					searchInput.val("");
					pageSession.set("MethodsDetailsCommandsViewSearchString", "");
				}

			}
			return false;
		}

		return true;
	},

	"click #dataview-insert-button": function(e, t) {
		e.preventDefault();
		Router.go("methods.details.insert", {methodId: this.params.methodId});
	},

	"click #dataview-export-default": function(e, t) {
		e.preventDefault();
		MethodsDetailsCommandsViewExport(this.method_commands, "csv");
	},

	"click #dataview-export-csv": function(e, t) {
		e.preventDefault();
		MethodsDetailsCommandsViewExport(this.method_commands, "csv");
	},

	"click #dataview-export-tsv": function(e, t) {
		e.preventDefault();
		MethodsDetailsCommandsViewExport(this.method_commands, "tsv");
	},

	"click #dataview-export-json": function(e, t) {
		e.preventDefault();
		MethodsDetailsCommandsViewExport(this.method_commands, "json");
	}

	
});

Template.MethodsDetailsCommandsView.helpers({
	"isEmpty": function() {
		return !this.method_commands || this.method_commands.count() == 0;
	},
	"isNotEmpty": function() {
		return this.method_commands && this.method_commands.count() > 0;
	},
	"isNotFound": function() {
		return this.method_commands && pageSession.get("MethodsDetailsCommandsViewSearchString") && MethodsDetailsCommandsViewItems(this.method_commands).length == 0;
	},
	"searchString": function() {
		return pageSession.get("MethodsDetailsCommandsViewSearchString");
	},
	"viewAsTable": function() {
		return pageSession.get("MethodsDetailsCommandsViewStyle") == "table";
	},
	"viewAsList": function() {
		return pageSession.get("MethodsDetailsCommandsViewStyle") == "list";
	},
	"viewAsGallery": function() {
		return pageSession.get("MethodsDetailsCommandsViewStyle") == "gallery";
	}

	
});


Template.MethodsDetailsCommandsViewTable.rendered = function() {
	
};

Template.MethodsDetailsCommandsViewTable.events({
	"click .th-sortable": function(e, t) {
		e.preventDefault();
		var oldSortBy = pageSession.get("MethodsDetailsCommandsViewSortBy");
		var newSortBy = $(e.target).attr("data-sort");

		pageSession.set("MethodsDetailsCommandsViewSortBy", newSortBy);
		if(oldSortBy == newSortBy) {
			var sortAscending = pageSession.get("MethodsDetailsCommandsViewSortAscending") || false;
			pageSession.set("MethodsDetailsCommandsViewSortAscending", !sortAscending);
		} else {
			pageSession.set("MethodsDetailsCommandsViewSortAscending", true);
		}
	}
});

Template.MethodsDetailsCommandsViewTable.helpers({
	"tableItems": function() {
		return MethodsDetailsCommandsViewItems(this.method_commands);
	}
});


Template.MethodsDetailsCommandsViewTableItems.rendered = function() {
	
};

Template.MethodsDetailsCommandsViewTableItems.events({
	"click td": function(e, t) {
		e.preventDefault();
		/**/
		return false;
	},

	"click #delete-button": function(e, t) {
		e.preventDefault();
		var me = this;
		bootbox.dialog({
			message: "Delete? Are you sure?",
			title: "Delete",
			animate: false,
			buttons: {
				success: {
					label: "Yes",
					className: "btn-success",
					callback: function() {
						MethodCommands.remove({ _id: me._id });
					}
				},
				danger: {
					label: "No",
					className: "btn-default"
				}
			}
		});
		return false;
	},
	"click #edit-button": function(e, t) {
		e.preventDefault();
		Router.go("methods.details.edit", {methodId: UI._parentData(1).params.methodId, commandId: this._id});
		return false;
	}
});

Template.MethodsDetailsCommandsViewTableItems.helpers({

});