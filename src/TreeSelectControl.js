import React, { useMemo } from "react";
import { withJsonFormsControlProps } from "@jsonforms/react";
import {
  TextField,
  Autocomplete,
  MenuItem,
  Checkbox,
} from "@mui/material";
const TreeSelectControl = ({
  data = [],
  handleChange,
  path,
  schema,
  visible,
}) => {

  // CREATE OPTIONS FOR SELECT , FROM SCHEMA DATA
  const options = useMemo(() => {
    return Object.keys(schema.properties).map((key) => ({
      title: schema.properties[key].title,
      value: key,
      children: schema.properties[key].enum.map((country) => ({
        title: country,
        value: country,
        parent_value: key,
      })),
    }));
  }, [schema.properties]);

// CREATE A LIST THAT CONTAINS BOTH PARENT & THEIR CHILDREN AT THE SAME LEVEL
  const flatOptions = useMemo(() => {
    return options.flatMap((option) => [option, ...option.children]);
  }, [options]);

  // MANAGE THE SELECT'S CHANGES 
  const handleOptionChange = (event, newValue) => {
    let newSelectedValues = newValue;
    let newArray = newValue.map((i) => i.value);
    
    // HANDLE THE CASE WHERE ELEMENTS ARE REMOVED 
    let removedElement = data.filter((element) => !newArray.includes(element));
    removedElement = flatOptions.filter((i) =>
      removedElement.includes(i.value)
    );
    removedElement.forEach((element) => {
      if (element.children) {
        newSelectedValues = newSelectedValues.filter(
          (i) => i.parent_value != element.value
        );
      } else {
        newSelectedValues = newSelectedValues.filter(
          (i) => i.value != element.parent_value
        );
      }
    });

    // MANAGE THE SELECTION & DESELECTION OF BOTH PARENTS & CHILDREN 
    let parentElement = newSelectedValues.filter((i) => i.children);
    let parentElementValues = parentElement.map((i) => i.value);
    let childElementWithParent = newSelectedValues.filter(
      (i) => !i.children && parentElementValues.includes(i.parent_value)
    );
    let childElementWithoutParent = newSelectedValues.filter(
      (i) => !i.children && !parentElementValues.includes(i.parent_value)
    );
    parentElement.forEach((element) => {
      childElementWithParent = childElementWithParent.filter(
        (i) => i.parent_value != element.key
      );
      childElementWithParent = [...childElementWithParent, ...element.children];
    });

    // IF ALL CHILDREN ARE SELECTED, THEIR PARENT IS SELECTED 
    const groupedByParent = childElementWithoutParent.reduce((acc, obj) => {
      const key = obj.parent_value;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});

    const result = Object.keys(groupedByParent).map((key) => ({
      parent_value: key,
      children: groupedByParent[key],
    }));
    result.forEach((element) => {
      let p = flatOptions.find((i) => i.value == element.parent_value);
      if (p && p.children.length == element.children.length) {
        childElementWithoutParent.push(p);
      }
    });
    newSelectedValues = [
      ...parentElement.map((i) => i.value),
      ...childElementWithParent.map((i) => i.value),
      ...childElementWithoutParent.map((i) => i.value),
    ];
    handleChange(path, Array.from(new Set(newSelectedValues)));
  };

  // RETURN THE LABELS OF ALL CHILDREN WHOSE PARENT IS SELECTED
  const displayValuesInput = () => {
    const selectedParents = options
      .filter(
        (parent) =>
          data.includes(parent.value) &&
          parent.children.every((child) => data.includes(child.value))
      )
      .map((parent) => parent.value);

    let selectedChildren = data.filter(
      (item) => !selectedParents.includes(item)
    );
    selectedChildren = selectedChildren.filter((i) =>
      flatOptions.find(
        (c) => c.value == i && selectedParents.includes(c.parent_value)
      )
    );
    return flatOptions.filter(
      (option) =>
        selectedChildren.includes(option.value)
    ).map(i=>i.title);
  };

  // PASS THE DATA IN THE FORM OF AN OBJECT
  const displayValues = useMemo(() => {
    const selectedParents = options
      .filter(
        (parent) =>
          data.includes(parent.value) &&
          parent.children.every((child) => data.includes(child.value))
      )
      .map((parent) => parent.value);

    const selectedChildren = data.filter(
      (item) =>
        !selectedParents.includes(item) &&
        options.every((parent) => parent.value !== item)
    );

    return flatOptions.filter(
      (option) =>
        selectedParents.includes(option.value) ||
        selectedChildren.includes(option.value)
    );
  }, [data, options, flatOptions]);

// VERIFY THE EXISTENCE OF THE ELEMENT
  const isOptionSelected = (option) => {
    return data.includes(option.value) || data.includes(option.parent_value);
  };

  return (
    <Autocomplete
      sx={{ mt: 2 }}
      multiple
      options={flatOptions}
      getOptionLabel={(option) => option.title}
      disableCloseOnSelect
      value={displayValues}
      onChange={handleOptionChange}
      renderInput={(params) => {
        // FORMAT THE DISPLAY WHEN PARENTS ARE SELECTED
        let customParams = params;
        let data = displayValuesInput();
        customParams.InputProps.startAdornment =  customParams.InputProps.startAdornment?.filter(i=>!data.includes(i.props.label))
        return (
          <TextField
            {...customParams}
            variant="outlined"
            label="Pays visités"
            placeholder="Selectionnez des options"
          />
        );
      }}
      renderOption={(props, option, { selected }) => (
        <MenuItem
          {...props}
          key={option.value}
          value={option.value}
          sx={{ justifyContent: "space-between" }}
        >
          <Checkbox checked={isOptionSelected(option)} color="info" style={{"marginLeft": option.children ? "0px" : "20px" }} />
          {option.title} 
        </MenuItem>
      )}
    />
  );
};

export default withJsonFormsControlProps(TreeSelectControl);
